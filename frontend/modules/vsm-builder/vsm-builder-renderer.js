window.VsmBuilderRenderer = Object.freeze({
  renderCanvas(processModel, vsmMap, metrics) {
    const dataByActivityUuid = window.CalculationEngine.indexBy(vsmMap.activityData, "activityUUID");
    const blocks = processModel.activities
      .map((activity) => this.renderActivityBlock(activity, dataByActivityUuid[activity.activityUUID]))
      .join("");

    const connectors = processModel.connections
      .map((connection) => this.renderConnection(connection, dataByActivityUuid))
      .join("");

    return `
      <section class="vsm-workspace" aria-label="Value Stream Map Builder">
        <div class="vsm-toolbar">
          <div>
            <p class="page-kicker">PB08 - VSM Builder</p>
            <h2 class="vsm-title">${vsmMap.name}</h2>
          </div>
          <div class="vsm-actions">
            <span class="environment-pill">Map type: ${vsmMap.mapType}</span>
            <span class="environment-pill" id="vsm-save-status">Saved</span>
          </div>
        </div>

        ${this.renderMetrics(metrics)}

        <div class="vsm-layout">
          <div class="vsm-canvas" id="vsm-canvas">
            <svg class="vsm-connections" aria-hidden="true">${connectors}</svg>
            ${blocks}
          </div>
          <aside class="vsm-editor" id="vsm-editor">
            <p class="status-note">Select an activity to edit VSM data.</p>
          </aside>
        </div>
      </section>
    `;
  },

  renderActivityBlock(activity, data) {
    return `
      <article
        class="vsm-activity"
        data-activity-uuid="${activity.activityUUID}"
        draggable="true"
        style="left:${data.x}px; top:${data.y}px; background:${data.color};"
      >
        <div class="vsm-activity-header">
          <span class="vsm-classification vsm-classification-${data.valueClassification.toLowerCase()}">${data.valueClassification}</span>
          <span class="status-note">#${data.sequence}</span>
        </div>
        <h3>${activity.name}</h3>
        <p>${activity.responsibleRole}</p>
        <dl class="vsm-time-grid">
          <div><dt>PT</dt><dd>${data.processTimeLikely} ${data.timeUnit}</dd></div>
          <div><dt>WT</dt><dd>${data.waitTimeLikely} ${data.timeUnit}</dd></div>
          <div><dt>QT</dt><dd>${data.queueTimeLikely} ${data.timeUnit}</dd></div>
          <div><dt>WIP</dt><dd>${data.wip}</dd></div>
        </dl>
      </article>
    `;
  },

  renderConnection(connection, dataByActivityUuid) {
    const source = dataByActivityUuid[connection.sourceActivityUUID];
    const target = dataByActivityUuid[connection.targetActivityUUID];

    if (!source || !target) {
      return "";
    }

    const x1 = source.x + 224;
    const y1 = source.y + 70;
    const x2 = target.x;
    const y2 = target.y + 70;

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="vsm-line" marker-end="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L7,3 z" fill="#5b6773" />
        </marker>
      </defs>`;
  },

  renderMetrics(metrics) {
    const metricItems = [
      ["Lead Time", metrics.leadTimeTotal],
      ["Process Time", metrics.processTimeTotal],
      ["VA Time", metrics.valueAddedTime],
      ["NNVA Time", metrics.necessaryNonValueAddedTime],
      ["NVA Time", metrics.nonValueAddedTime],
      ["VA %", `${metrics.valueAddedPercentage.toFixed(1)}%`],
      ["NVA %", `${metrics.nonValueAddedPercentage.toFixed(1)}%`],
      ["Handoffs", metrics.handoffCount],
      ["Activities", metrics.activityCount],
      ["Responsibles", metrics.responsibleCount],
      ["Waits", metrics.accumulatedWaitTime]
    ];

    return `
      <section class="vsm-metrics" aria-label="VSM metrics">
        ${metricItems
          .map(
            ([label, value]) => `
              <article class="vsm-metric">
                <p>${label}</p>
                <strong>${typeof value === "number" ? value.toFixed(1) : value}</strong>
              </article>
            `
          )
          .join("")}
      </section>
    `;
  },

  renderEditor(activity, data) {
    if (!activity || !data) {
      return `<p class="status-note">Select an activity to edit VSM data.</p>`;
    }

    return `
      <h3 class="panel-title">${activity.name}</h3>
      <label class="form-field">
        Classification
        <select data-vsm-field="valueClassification">
          ${["VA", "NNVA", "NVA"].map((item) => `<option value="${item}" ${data.valueClassification === item ? "selected" : ""}>${item}</option>`).join("")}
        </select>
      </label>
      ${this.renderNumberField("processTimeMin", "Process min", data.processTimeMin)}
      ${this.renderNumberField("processTimeLikely", "Process likely", data.processTimeLikely)}
      ${this.renderNumberField("processTimeMax", "Process max", data.processTimeMax)}
      ${this.renderNumberField("waitTimeMin", "Wait min", data.waitTimeMin)}
      ${this.renderNumberField("waitTimeLikely", "Wait likely", data.waitTimeLikely)}
      ${this.renderNumberField("waitTimeMax", "Wait max", data.waitTimeMax)}
      ${this.renderNumberField("queueTimeMin", "Queue min", data.queueTimeMin)}
      ${this.renderNumberField("queueTimeLikely", "Queue likely", data.queueTimeLikely)}
      ${this.renderNumberField("queueTimeMax", "Queue max", data.queueTimeMax)}
      ${this.renderNumberField("frequency", "Frequency", data.frequency)}
      ${this.renderNumberField("wip", "WIP", data.wip)}
    `;
  },

  renderNumberField(field, label, value) {
    return `
      <label class="form-field">
        ${label}
        <input type="number" min="0" data-vsm-field="${field}" value="${value}" />
      </label>
    `;
  }
});

