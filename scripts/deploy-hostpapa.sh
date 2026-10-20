#!/usr/bin/env bash
# Deploy the HostPapa build (public_html) to cPanel over SFTP with lftp.
# DEFAULT IS A LOCAL DRY RUN: no network connection, just lists what would be uploaded.
#
#   scripts/deploy-hostpapa.sh                     # dry run (default, offline)
#   HOSTPAPA_FTP_PASSWORD=... scripts/deploy-hostpapa.sh --live --yes
#
# Options:
#   --build DIR   build folder containing public_html (default /workspace/deploy/build-hostpapa)
#   --live        actually connect and upload (requires --yes and HOSTPAPA_FTP_PASSWORD)
#   --yes         confirm a live upload
#   --delete      also delete remote files that are not in the build (off by default; never touches api/config.php)
set -euo pipefail
HOST="${HOSTPAPA_HOST:-sh-cp18-au.yyz2.servername.online}"
USER_NAME="${HOSTPAPA_USER:-splco501}"
REMOTE_DIR="${HOSTPAPA_REMOTE_DIR:-/home/splco501/public_html}"
BUILD="/workspace/deploy/build-hostpapa"; LIVE=0; YES=0; DELETE=""
while [ $# -gt 0 ]; do case "$1" in
  --build) BUILD="$2"; shift 2;; --live) LIVE=1; shift;; --yes) YES=1; shift;;
  --delete) DELETE="--delete"; shift;; --dry-run) LIVE=0; shift;;
  *) echo "Unknown option $1"; exit 2;; esac; done
SRC="$BUILD/public_html"
[ -f "$SRC/index.html" ] && [ -f "$SRC/.htaccess" ] || { echo "No build at $SRC (run node scripts/build-hostpapa.cjs)"; exit 1; }
EXCLUDES=(--exclude-glob .DS_Store --exclude '^api/ratelimit/')
# Keep the server's own config.php (holds any SMTP password) unless it does not exist yet: upload config.php only on first deploy.
EXCLUDES+=(--exclude '^api/config\.php$')
CMD="mirror --reverse --verbose --only-newer --parallel=4 $DELETE ${EXCLUDES[*]} \"$SRC\" \"$REMOTE_DIR\""
if [ "$LIVE" -ne 1 ]; then
  echo "DRY RUN (offline): nothing will connect to $HOST."
  echo "Would run: lftp sftp://$USER_NAME@$HOST -e '$CMD; bye'"
  echo "Files that would be uploaded from $SRC:"
  (cd "$SRC" && find . -type f ! -name config.php -printf '%P\t%s\n' | sort) > /tmp/hostpapa-dryrun.txt
  echo "  $(wc -l < /tmp/hostpapa-dryrun.txt) files, $(du -sh "$SRC" | cut -f1) total (list: /tmp/hostpapa-dryrun.txt)"
  echo "  api/config.php is NOT uploaded by default: upload it once by hand (cPanel File Manager), then edit on the server."
  [ -n "$DELETE" ] && echo "  --delete: remote files not in the build would be removed (except api/config.php)."
  exit 0
fi
[ "$YES" -eq 1 ] || { echo "Refusing live upload without --yes"; exit 1; }
[ -n "${HOSTPAPA_FTP_PASSWORD:-}" ] || { echo "Set HOSTPAPA_FTP_PASSWORD"; exit 1; }
command -v lftp >/dev/null || { echo "lftp not installed"; exit 1; }
export LFTP_PASSWORD="$HOSTPAPA_FTP_PASSWORD"
lftp --env-password -e "set sftp:auto-confirm yes; set net:max-retries 2; $CMD; bye" "sftp://$USER_NAME@$HOST"
echo "Uploaded. Check: curl -sI --resolve spl.com.au:80:66.102.137.241 http://spl.com.au/"
