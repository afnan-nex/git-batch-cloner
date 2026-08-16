/**
 * schedule.js — Schedule management page
 */

async function renderSchedule() {
  renderScheduleActions();
  await renderScheduleBody();
}

function renderScheduleActions() {
  const el = document.getElementById('schedule-actions');
  if (!el) return;
  el.innerHTML = '';

  const addBtn = document.createElement('button');
  addBtn.className = 'md-btn md-btn-filled md-btn-icon';
  addBtn.id = 'schedule-add-btn';
  addBtn.setAttribute('aria-label', 'Add Schedule');
  addBtn.innerHTML = UI.iconHtml('add', '18px') + '<span>Schedule Clone</span>';
  addBtn.addEventListener('click', showScheduleDialog);
  el.appendChild(addBtn);
}

async function renderScheduleBody() {
  const body = document.getElementById('schedule-body');
  if (!body) return;

  body.innerHTML = '';

  let jobs = [];
  try {
    jobs = await window.api.schedule.getAll();
  } catch (e) {
    body.innerHTML = `<div class="empty-state"><div class="empty-state-title">Failed to load schedules</div></div>`;
    return;
  }

  if (jobs.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${UI.iconHtml('schedule', '64px')}</div>
        <div class="empty-state-title">No scheduled clones</div>
        <div class="empty-state-body">Schedule a one-time clone operation to run at a specific date and time.</div>
        <button class="md-btn md-btn-filled md-btn-icon" id="schedule-empty-add">
          ${UI.iconHtml('add', '18px')}<span>Schedule Clone</span>
        </button>
      </div>
    `;
    document.getElementById('schedule-empty-add')?.addEventListener('click', showScheduleDialog);
    return;
  }

  const list = document.createElement('div');
  list.className = 'schedule-list';

  jobs.forEach(job => {
    const item = document.createElement('div');
    item.className = 'schedule-item';
    item.innerHTML = `
      <span style="color:var(--md-sys-color-primary)">${UI.iconHtml('schedule', '32px')}</span>
      <div class="schedule-item-info">
        <div class="schedule-item-time">${UI.formatDate(job.scheduled_at)}</div>
        <div class="schedule-item-label">${UI.escapeHtml(job.label || 'Scheduled Clone')}</div>
        <div style="margin-top:4px">
          <span class="status-badge ${job.status === 'done' ? 'status-badge-active' : job.status === 'pending' ? 'status-badge-pending' : 'status-badge-error'}">
            ${UI.escapeHtml(job.status)}
          </span>
        </div>
      </div>
      <button class="md-icon-btn" id="del-job-${job.id}" data-tooltip="Delete Schedule" aria-label="Delete schedule" style="color:var(--md-sys-color-error)">
        ${UI.iconHtml('delete', '20px')}
      </button>
    `;
    list.appendChild(item);

    item.querySelector(`#del-job-${job.id}`)?.addEventListener('click', () => deleteSchedule(job));
  });

  body.appendChild(list);
}

async function deleteSchedule(job) {
  const confirmed = await UI.showConfirm({
    icon: 'delete',
    headline: 'Delete Schedule',
    body: `Delete the scheduled clone for ${UI.escapeHtml(UI.formatDate(job.scheduled_at))}?`,
    confirmLabel: 'Delete',
    confirmClass: 'md-btn-error'
  });
  if (!confirmed) return;

  try {
    await window.api.schedule.delete(job.id);
    UI.showSnackbar('Schedule deleted');
    await renderScheduleBody();
  } catch (e) {
    UI.showSnackbar(`Failed to delete: ${e.message}`);
  }
}

function showScheduleDialog() {
  const now = new Date();
  let selectedDateStr = now.toISOString().split('T')[0];
  let selectedTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const form = document.createElement('div');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '16px';

  // Date picker card/field
  const dateField = buildM3DateField(selectedDateStr, async (newVal) => {
    selectedDateStr = newVal;
  });

  // Time picker card/field
  const timeField = buildM3TimeField(selectedTimeStr, async (newVal) => {
    selectedTimeStr = newVal;
  });

  // Label field
  const labelField = buildLabelField();

  form.appendChild(dateField.el);
  form.appendChild(timeField.el);
  form.appendChild(labelField.el);

  const errorDiv = document.createElement('div');
  errorDiv.className = 'md-field-supporting text-error';
  errorDiv.id = 'schedule-error';
  form.appendChild(errorDiv);

  UI.showDialog({
    icon: 'schedule',
    headline: 'Schedule Repository Clone',
    body: form,
    actions: [
      { label: 'Cancel', className: 'md-btn md-btn-text', onClick: (close) => close() },
      {
        label: 'Schedule',
        id: 'schedule-confirm-btn',
        className: 'md-btn md-btn-filled',
        onClick: async (close) => {
          const dateVal = selectedDateStr;
          const timeVal = selectedTimeStr;
          const labelVal = labelField.input.value || 'Scheduled Clone';
          const errorEl = document.getElementById('schedule-error');

          if (!dateVal || !timeVal) {
            if (errorEl) errorEl.textContent = 'Please select a date and time';
            return;
          }

          const scheduledAt = new Date(`${dateVal}T${timeVal}:00`);
          if (scheduledAt <= new Date()) {
            if (errorEl) errorEl.textContent = 'Scheduled time must be in the future';
            return;
          }

          const btn = document.getElementById('schedule-confirm-btn');
          if (btn) btn.disabled = true;

          try {
            await window.api.schedule.add({
              label: labelVal,
              scheduledAt: scheduledAt.toISOString()
            });
            close();
            UI.showSnackbar(`Scheduled for ${UI.formatDate(scheduledAt.toISOString())}`);
            await renderScheduleBody();
          } catch (e) {
            if (errorEl) errorEl.textContent = e.message || 'Failed to schedule';
            if (btn) btn.disabled = false;
          }
        }
      }
    ]
  });
}

function buildM3DateField(defaultVal, onDateChange) {
  const wrapper = document.createElement('div');
  wrapper.className = 'md-field';
  wrapper.style.cursor = 'pointer';

  let currentDate = defaultVal;

  function updateDisplay() {
    const d = new Date(currentDate + 'T00:00:00');
    const formatted = isNaN(d.getTime()) ? currentDate : d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    
    wrapper.innerHTML = `
      <div class="md-field-input-wrap" style="cursor:pointer">
        <div class="md-field-input" style="padding-top:16px;display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:14px;color:var(--md-sys-color-on-surface)">${UI.escapeHtml(formatted)}</span>
          <span style="color:var(--md-sys-color-primary);display:flex">${UI.iconHtml('schedule', '20px')}</span>
        </div>
        <label class="md-field-label" style="top:10px;font-size:12px;color:var(--md-sys-color-primary)">Schedule Date</label>
      </div>
    `;
  }

  updateDisplay();

  wrapper.addEventListener('click', async () => {
    const picked = await UI.showDatePicker({
      initialDate: currentDate,
      minDate: new Date()
    });
    if (picked) {
      currentDate = picked;
      updateDisplay();
      if (onDateChange) onDateChange(picked);
    }
  });

  return { el: wrapper, getValue: () => currentDate };
}

function buildM3TimeField(defaultVal, onTimeChange) {
  const wrapper = document.createElement('div');
  wrapper.className = 'md-field';
  wrapper.style.cursor = 'pointer';

  let currentTime = defaultVal;

  function formatTimeDisplay(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }

  function updateDisplay() {
    wrapper.innerHTML = `
      <div class="md-field-input-wrap" style="cursor:pointer">
        <div class="md-field-input" style="padding-top:16px;display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:14px;color:var(--md-sys-color-on-surface)">${UI.escapeHtml(formatTimeDisplay(currentTime))}</span>
          <span style="color:var(--md-sys-color-primary);display:flex">${UI.iconHtml('access_time', '20px')}</span>
        </div>
        <label class="md-field-label" style="top:10px;font-size:12px;color:var(--md-sys-color-primary)">Schedule Time</label>
      </div>
    `;
  }

  updateDisplay();

  wrapper.addEventListener('click', async () => {
    const picked = await UI.showTimePicker({
      initialTime: currentTime
    });
    if (picked) {
      currentTime = picked;
      updateDisplay();
      if (onTimeChange) onTimeChange(picked);
    }
  });

  return { el: wrapper, getValue: () => currentTime };
}

function buildLabelField() {
  const wrapper = document.createElement('div');
  wrapper.className = 'md-field';
  wrapper.innerHTML = `
    <div class="md-field-input-wrap">
      <input type="text" id="schedule-label" class="md-field-input" placeholder=" " aria-label="Schedule label">
      <label class="md-field-label" for="schedule-label">Label (optional)</label>
    </div>
    <div class="md-field-supporting">e.g. "Nightly backup"</div>
  `;
  return { el: wrapper, input: wrapper.querySelector('input') };
}

document.addEventListener('page:activated', (e) => {
  if (e.detail.page === 'schedule') renderSchedule();
});

document.addEventListener('schedule:openDialog', () => {
  showScheduleDialog();
});

