/* Customer Portal quote form: multipart photos + honeypot, time trap, maths challenge + success dialog. */
(function () {
  var form = document.getElementById('portal-quote-form');
  if (!form || !window.fetch || !window.FormData) return;

  var endpoint = form.getAttribute('action') || '../api/portal-quote';
  var thankYou = form.getAttribute('data-thank-you') || '';
  var shown = Date.now();
  var maxFiles = 6;
  var maxEach = 4 * 1024 * 1024;
  var maxTotal = 12 * 1024 * 1024;
  var acceptExt = { jpg: 1, jpeg: 1, png: 1, webp: 1, heic: 1, heif: 1 };

  var msg = {
    sending: 'Sending your quote request…',
    fields: 'Please check the highlighted fields.',
    limit: 'Too many requests from this connection. Please try again later or call (07) 55 888 111.',
    fail: 'Sorry, your quote request could not be sent. Please call (07) 55 888 111 or email info@spl.com.au.',
    challenge: 'Could not load the security question. Please refresh the page.',
    files: 'You can attach up to 6 photos (JPG, PNG, WebP or HEIC), 4 MB each, 12 MB total.'
  };

  var fileInput = form.querySelector('#portal-photos');
  var fileList = form.querySelector('#portal-file-list');
  var dropzone = form.querySelector('#portal-dropzone');
  var challengeLabel = form.querySelector('#portal-challenge-label');
  var challengeToken = form.querySelector('input[name="challenge_token"]');
  var challengeAnswer = form.querySelector('input[name="challenge_answer"]');
  var statusEl = form.querySelector('.form-status');
  var dialog = document.getElementById('portal-success');
  var panel = document.getElementById('portal-success-panel');
  var section = document.getElementById('portal-quote');
  var selected = [];
  var reqType = form.querySelector('select[name="request_type"]');
  var photosLabel = document.getElementById('portal-photos-label');
  var photoHint = form.querySelector('.portal-hint');
  function isServiceCall() { return reqType && reqType.value === 'service_call'; }
  var submitBtn = form.querySelector('[type="submit"]');
  function updateRequestTypeUI() {
    if (photosLabel) {
      photosLabel.innerHTML = isServiceCall()
        ? '<strong>Attach photos</strong> (required for service calls) — up to 6 images, JPG, PNG, WebP or HEIC, 4&nbsp;MB each'
        : '<strong>Attach photos</strong> (optional) — up to 6 images, JPG, PNG, WebP or HEIC, 4&nbsp;MB each';
    }
    if (photoHint) photoHint.textContent = isServiceCall()
      ? 'Service calls need at least one clear photo showing the reported issue (door lock, electric strike, camera, etc) so we can prepare the correct replacement products.'
      : 'Clear photos of the lock, door, hinge side or control panel help us prepare an accurate quote.';
    if (submitBtn && !submitBtn.disabled) {
      if (isServiceCall()) submitBtn.textContent = 'Submit service call request';
      else if (reqType && reqType.value === 'quote_request') submitBtn.textContent = 'Submit quote request';
      else submitBtn.textContent = 'Submit request';
    }
    msg.sending = isServiceCall() ? 'Sending your service call…' : 'Sending your quote request…';
  }
  if (reqType) { reqType.addEventListener('change', updateRequestTypeUI); updateRequestTypeUI(); }
  var lastFocus = null;

  function clearErrors() {
    form.querySelectorAll('[aria-invalid]').forEach(function (f) {
      f.removeAttribute('aria-invalid');
      f.removeAttribute('aria-describedby');
    });
    form.querySelectorAll('.form-error').forEach(function (e) { e.remove(); });
  }

  function mark(name, text) {
    var f = form.elements[name];
    if (!f) return null;
    var id = (form.id || 'form') + '-' + name + '-error';
    var e = document.createElement('span');
    e.className = 'form-error';
    e.id = id;
    e.textContent = text;
    f.insertAdjacentElement('afterend', e);
    f.setAttribute('aria-invalid', 'true');
    f.setAttribute('aria-describedby', id);
    return f;
  }

  function extOf(name) {
    var m = /\.([A-Za-z0-9]+)$/.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  function formatSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderFiles() {
    if (!fileList) return;
    fileList.innerHTML = '';
    if (!selected.length) {
      fileList.hidden = true;
      return;
    }
    fileList.hidden = false;
    selected.forEach(function (file, idx) {
      var li = document.createElement('li');
      li.className = 'portal-file-item';
      var name = document.createElement('span');
      name.className = 'portal-file-name';
      name.textContent = file.name + ' (' + formatSize(file.size) + ')';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'portal-file-remove';
      btn.setAttribute('aria-label', 'Remove ' + file.name);
      btn.textContent = 'Remove';
      btn.addEventListener('click', function () {
        selected.splice(idx, 1);
        syncInput();
        renderFiles();
      });
      li.appendChild(name);
      li.appendChild(btn);
      fileList.appendChild(li);
    });
  }

  function syncInput() {
    if (!fileInput) return;
    var dt = new DataTransfer();
    selected.forEach(function (f) { dt.items.add(f); });
    fileInput.files = dt.files;
  }

  function addFiles(fileListLike) {
    var incoming = Array.prototype.slice.call(fileListLike || []);
    var err = '';
    incoming.forEach(function (file) {
      if (selected.length >= maxFiles) {
        err = msg.files;
        return;
      }
      if (!acceptExt[extOf(file.name)]) {
        err = msg.files;
        return;
      }
      if (file.size > maxEach) {
        err = msg.files;
        return;
      }
      var total = selected.reduce(function (s, f) { return s + f.size; }, 0) + file.size;
      if (total > maxTotal) {
        err = msg.files;
        return;
      }
      var dup = selected.some(function (f) { return f.name === file.name && f.size === file.size; });
      if (!dup) selected.push(file);
    });
    syncInput();
    renderFiles();
    if (err && statusEl) {
      statusEl.className = 'form-status error';
      statusEl.textContent = err;
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      addFiles(fileInput.files);
    });
  }

  if (dropzone && fileInput) {
    ['dragenter', 'dragover'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('is-dragover');
      });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
    dropzone.addEventListener('click', function (e) {
      if (e.target.closest('button, a, label, input')) return;
      fileInput.click();
    });
    dropzone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
  }

  function loadChallenge() {
    return fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok !== false, body: j }; }); })
      .then(function (res) {
        if (!res.ok || !res.body.token) throw new Error('challenge');
        if (challengeToken) challengeToken.value = res.body.token;
        if (challengeLabel) {
          challengeLabel.textContent = 'Security check: what is ' + res.body.a + ' + ' + res.body.b + '?';
        }
        if (challengeAnswer) {
          challengeAnswer.value = '';
          challengeAnswer.setAttribute('aria-label', 'Security check: what is ' + res.body.a + ' + ' + res.body.b + '?');
        }
      })
      .catch(function () {
        if (statusEl) {
          statusEl.className = 'form-status error';
          statusEl.textContent = msg.challenge;
        }
      });
  }

  function applySuccessCopy() {
    var service = isServiceCall();
    var kicker = service ? 'SERVICE CALL RECEIVED' : 'QUOTE REQUEST RECEIVED';
    var bodyHtml = service
      ? 'Your service call has been received. <strong>Our team will contact you as soon as possible.</strong>'
      : 'Your quote request has been received. <strong>Our team will contact you as soon as possible.</strong>';
    var statusText = service
      ? 'Thanks, your service call has been sent. Our team will contact you as soon as possible.'
      : 'Thanks, your quote request has been sent. Our team will contact you as soon as possible.';
    document.querySelectorAll('[data-portal-success-kicker]').forEach(function (el) { el.textContent = kicker; });
    document.querySelectorAll('[data-portal-success-body]').forEach(function (el) { el.innerHTML = bodyHtml; });
    return statusText;
  }
  function showSuccess() {
    var statusText = applySuccessCopy();
    if (section) section.classList.add('is-submitted');
    if (statusEl) {
      statusEl.className = 'form-status success';
      statusEl.textContent = statusText;
    }
    if (panel) {
      panel.hidden = false;
    }
    lastFocus = document.activeElement;
    if (dialog && typeof dialog.showModal === 'function') {
      try {
        dialog.showModal();
        var focusable = dialog.querySelector('.portal-success-primary, .portal-success-close, button, a');
        if (focusable) focusable.focus();
        return;
      } catch (err) { /* fall through to panel */ }
    }
    if (panel) {
      panel.focus();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (thankYou) {
      location.href = thankYou;
    }
  }

  function closeSuccess() {
    if (dialog && dialog.open) dialog.close();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  if (dialog) {
    dialog.querySelectorAll('[data-portal-success-close]').forEach(function (btn) {
      btn.addEventListener('click', closeSuccess);
    });
    dialog.addEventListener('cancel', function (e) {
      // Allow Escape to close; keep the on-page success panel visible.
      e.preventDefault();
      closeSuccess();
    });
  }

  loadChallenge();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    if (!form.reportValidity()) return;
    if (isServiceCall() && !selected.length) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Please attach at least one photo for a service call.';
      var dz = document.getElementById('portal-dropzone');
      if (dz) dz.focus();
      return;
    }

    var status = statusEl;
    var btn = form.querySelector('[type="submit"]');
    var fd = new FormData(form);
    fd.set('elapsed_ms', String(Date.now() - shown));
    fd.delete('photos[]');
    fd.delete('photos');
    selected.forEach(function (f) { fd.append('photos[]', f, f.name); });

    // Honeypot: behave as if sent (show success UI, do not hit the network).
    if (fd.get('website')) {
      showSuccess();
      return;
    }

    btn.disabled = true;
    if (status) {
      status.className = 'form-status';
      status.textContent = msg.sending;
    }

    fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: fd, credentials: 'same-origin' })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          return { status: r.status, ok: r.ok && j.ok !== false, body: j };
        });
      })
      .then(function (res) {
        if (res.ok) {
          showSuccess();
          return;
        }
        if (status) status.className = 'form-status error';
        if (res.status === 422 && res.body.fields) {
          var first;
          Object.keys(res.body.fields).forEach(function (k) {
            var f = mark(k, res.body.fields[k]);
            first = first || f;
          });
          if (status) status.textContent = msg.fields;
          if (first) first.focus();
          loadChallenge();
        } else if (status) {
          status.textContent = res.status === 429 ? msg.limit : (res.body.error || msg.fail);
          if (res.status !== 429) loadChallenge();
        }
      })
      .catch(function () {
        if (status) {
          status.className = 'form-status error';
          status.textContent = msg.fail;
        }
      })
      .then(function () { btn.disabled = false; });
  });
})();
