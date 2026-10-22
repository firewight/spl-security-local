#!/usr/bin/env bash
# Build + publish the SPL site to the HostPapa STAGING preview (noindex) via the cPanel UAPI.
#   HOSTPAPA_CPANEL_TOKEN=... scripts/deploy-hostpapa-staging.sh          # build, deploy, prune, verify
#   options: --no-build (reuse existing build)  --no-prune  --verify-only
# Never prints the token. Keeps the server's api/config.php (staging: log transport, preview origin).
# Keeps .well-known, cgi-bin and cPanel's PHP handler lines in .htaccess. Deletes the uploaded zip.
set -euo pipefail
cd "$(dirname "$0")/.."
SERVER="${HOSTPAPA_CPANEL_URL:-https://66.102.137.241:2083}"; CPUSER="${HOSTPAPA_USER:-splco501}"
HOME_DIR="/home/$CPUSER"; DOCROOT="$HOME_DIR/public_html"
PREVIEW="${HOSTPAPA_PREVIEW_URL:-http://66.102.137.241/~$CPUSER}"
MANIFEST_NAME=".spl-staging-manifest.txt"   # stored in $HOME_DIR (not web-visible)
BUILD_OUT="/workspace/deploy/build-hostpapa"; STAGE="/workspace/deploy/stage"; ZIP="/workspace/deploy/spl-stage.zip"
KEEP_RE='^(\.well-known|cgi-bin)(/|$)'
BUILD=1; PRUNE=1; DEPLOY=1
for a in "$@"; do case "$a" in --no-build) BUILD=0;; --no-prune) PRUNE=0;; --verify-only) BUILD=0; DEPLOY=0;; *) echo "Unknown option $a"; exit 2;; esac; done
[ -n "${HOSTPAPA_CPANEL_TOKEN:-}" ] || { echo "Set HOSTPAPA_CPANEL_TOKEN"; exit 1; }
for c in curl zip python3 node; do command -v $c >/dev/null || { echo "$c missing"; exit 1; }; done

hdr(){ printf 'header = "Authorization: cpanel %s:%s"\n' "$CPUSER" "$HOSTPAPA_CPANEL_TOKEN"; }
uapi(){ local m=$1 f=$2; shift 2; local a=(); for x in "$@"; do a+=(--data-urlencode "$x"); done
  curl -sk -m 300 --config <(hdr) -G "$SERVER/execute/$m/$f" "${a[@]}"; }
api2(){ local a=(); for x in "$@"; do a+=(--data-urlencode "$x"); done
  curl -sk -m 300 --config <(hdr) -G "$SERVER/json-api/cpanel" --data-urlencode "cpanel_jsonapi_user=$CPUSER" --data-urlencode cpanel_jsonapi_apiversion=2 "${a[@]}"; }
ok_uapi(){ python3 -c 'import json,sys;d=json.load(sys.stdin);sys.exit(0 if d.get("status")==1 else (print("API error:",d.get("errors"),file=sys.stderr) or 1))'; }
ok_api2(){ python3 -c 'import json,sys;d=json.load(sys.stdin)["cpanelresult"];r=d.get("data") or [{}];sys.exit(0 if not d.get("error") and all(x.get("result")==1 for x in r) else (print("API error:",d.get("error"),r,file=sys.stderr) or 1))'; }
fileop(){ api2 cpanel_jsonapi_module=Fileman cpanel_jsonapi_func=fileop "op=$1" "sourcefiles=$2" ${3:+"destfiles=$3"} doubledecode=0 | ok_api2; }
getfile(){ uapi Fileman get_file_content "dir=$1" "file=$2" | python3 -c 'import json,sys;d=json.load(sys.stdin);sys.stdout.write((d.get("data") or {}).get("content","") if d.get("status")==1 else "")'; }
exists(){ uapi Fileman list_files "dir=$1" show_hidden=1 | python3 -c 'import json,sys;n=sys.argv[1];d=json.load(sys.stdin).get("data") or [];sys.exit(0 if any(f["file"]==n for f in d) else 1)' "$2"; }

if [ $DEPLOY -eq 1 ]; then
  [ $BUILD -eq 1 ] && node scripts/build-hostpapa.cjs --out "$BUILD_OUT" >/dev/null
  rm -rf "$STAGE" "$ZIP"; mkdir -p "$STAGE"; cp -a "$BUILD_OUT/public_html/." "$STAGE/"
  # Server's api/config.php wins. Only on a first deploy, upload a staging config (log transport, preview origin, no secrets).
  if exists "$DOCROOT/api" config.php; then rm -f "$STAGE/api/config.php"; echo "Keeping server api/config.php"
  else sed -i "s/'transport'   => 'mail',/'transport'   => 'log',/; s#'allowed_origins' => \[#'allowed_origins' => ['${PREVIEW%%/~*}', #" "$STAGE/api/config.php"; echo "First deploy: uploading staging api/config.php (log transport)"; fi
  # Preserve cPanel's PHP handler block from the server's .htaccess.
  BLOCK=$(getfile "$DOCROOT" .htaccess | sed -n '/# php -- BEGIN cPanel-generated handler/,/# php -- END cPanel-generated handler/p')
  [ -n "$BLOCK" ] || BLOCK=$'# php -- BEGIN cPanel-generated handler, do not edit\n# This domain inherits the “PHP” package.\n# php -- END cPanel-generated handler, do not edit'
  { printf '%s\n\n' "$BLOCK"; cat "$STAGE/.htaccess"; } > "$STAGE/.htaccess.new" && mv "$STAGE/.htaccess.new" "$STAGE/.htaccess"
  (cd "$STAGE" && find . -mindepth 1 \( -type f -o -type l \) -printf '%P\n' | sort > "/tmp/$MANIFEST_NAME")
  (cd "$STAGE" && zip -qr -X "$ZIP" .)
  ZNAME=".spl-deploy-$(date +%s).zip"
  echo "Uploading $(du -h "$ZIP" | cut -f1) ($(wc -l < "/tmp/$MANIFEST_NAME") files)"
  curl -sk -m 900 --config <(hdr) -F "dir=$HOME_DIR" -F overwrite=1 -F "file-1=@$ZIP;filename=$ZNAME" "$SERVER/execute/Fileman/upload_files" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);sys.exit(0 if d.get("status")==1 and (d.get("data") or {}).get("failed")==0 else (print("Upload failed:",d.get("errors"),file=sys.stderr) or 1))'
  trap 'fileop unlink "$HOME_DIR/$ZNAME" >/dev/null 2>&1 || true' EXIT   # zip lives outside public_html; always removed
  fileop extract "$HOME_DIR/$ZNAME" "$DOCROOT"
  fileop unlink "$HOME_DIR/$ZNAME"; trap - EXIT; echo "Extracted into $DOCROOT; zip removed"
  if [ $PRUNE -eq 1 ]; then
    OLD=$(getfile "$HOME_DIR" "$MANIFEST_NAME" || true)
    # Files from the previous deploy that are gone now, plus top-level leftovers not in the build.
    TOP=$(uapi Fileman list_files "dir=$DOCROOT" show_hidden=1 | python3 -c 'import json,sys;[print(f["file"]) for f in json.load(sys.stdin)["data"]]')
    NEWTOP=$(cut -d/ -f1 "/tmp/$MANIFEST_NAME" | sort -u)
    STALE=$( { [ -n "$OLD" ] && comm -23 <(printf '%s\n' "$OLD" | sort -u) "/tmp/$MANIFEST_NAME"; comm -23 <(printf '%s\n' "$TOP" | sort -u) <(printf '%s\n' "$NEWTOP"); } \
      | grep -Ev "$KEEP_RE" | grep -Ev '^api/config\.php$' | grep -v '^$' | sort -u || true)
    n=0; while IFS= read -r p; do [ -z "$p" ] && continue; case "$p" in *..*) continue;; esac
      fileop unlink "$DOCROOT/$p" && { echo "  removed $p"; n=$((n+1)); }; done <<< "$STALE"
    echo "Pruned $n stale item(s)"
    uapi Fileman save_file_content "dir=$HOME_DIR" "file=$MANIFEST_NAME" "content=$(cat /tmp/$MANIFEST_NAME)" | ok_uapi
  fi
  rm -f "$ZIP"
fi

# Verify
fail=0
for p in / about/ contact/ locations/ ballina/ commercial-locksmith/ emergency-locksmith/ access-control-systems/ alarm-system/ robots.txt; do
  c=$(curl -s -m 30 -o /dev/null -w '%{http_code}' "$PREVIEW/$p"); printf '  %s %s\n' "$c" "/$p"; [ "$c" = 200 ] || fail=1; done
curl -s -m 30 "$PREVIEW/robots.txt" | grep -qx 'Disallow: /' && echo "  robots.txt: Disallow: / OK" || { echo "  robots.txt: Disallow missing"; fail=1; }
curl -sI -m 30 "$PREVIEW/" | grep -qi '^x-robots-tag: noindex' && echo "  X-Robots-Tag noindex OK" || { echo "  X-Robots-Tag missing"; fail=1; }
c=$(curl -s -m 30 -o /dev/null -w '%{http_code}' "$PREVIEW/api/config.php"); [ "$c" = 403 ] && echo "  api/config.php blocked (403) OK" || { echo "  api/config.php returned $c"; fail=1; }
for f in vendor/autoload.php vendor/composer/installed.php vendor/phpmailer/phpmailer/src/PHPMailer.php composer.json composer.lock config.example.php; do c=$(curl -s -m 30 -o /dev/null -w '%{http_code}' "$PREVIEW/api/$f"); case $c in 403|404) echo "  api/$f blocked ($c) OK";; *) echo "  api/$f returned $c"; fail=1;; esac; done
python3 - "$PREVIEW" <<'PY' || fail=1
import re,sys,urllib.request as u,urllib.parse as up
B=sys.argv[1].rstrip('/')+'/';seen=set();bad=[]
for p in ['','about/','contact/','ballina/']:
    h=u.urlopen(B+p,timeout=30).read().decode('utf8','replace')
    for r in re.findall(r'(?:href|src)="([^"#?]+\.(?:css|js|webp|jpe?g|png|svg|avif))"',h):
        a=up.urljoin(B+p,r)
        if a.startswith(B) and a not in seen:
            seen.add(a)
            try: s=u.urlopen(u.Request(a,method='HEAD'),timeout=30).status
            except Exception as e: s=e
            if s!=200: bad.append((a,s))
print(f"  assets: {len(seen)} checked, {len(bad)} failed");[print('   ',b) for b in bad[:10]];sys.exit(1 if bad else 0)
PY
[ $fail -eq 0 ] && echo "STAGING OK: $PREVIEW/" || { echo "STAGING CHECKS FAILED"; exit 1; }
