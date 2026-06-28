window.CalculationEngine = Object.freeze({
  expectedTriangular(min, likely, max) {
    const a = Number(min) || 0;
    const m = Number(likely) || 0;
    const b = Number(max) || 0;

    if (a < 0 || m < 0 || b < 0) {
      return 0;
    }

    return (a + m + b) / 3;
  },

  sum(values) {
    return values.reduce((total, value) => total + (Number(value) || 0), 0);
  },

  percentage(part, total) {
    const denominator = Number(total) || 0;

    if (denominator <= 0) {
      return 0;
    }

    return ((Number(part) || 0) / denominator) * 100;
  },

  countDistinct(values) {
    return new Set(values.filter(Boolean)).size;
  },

  calculateVsmMetrics(activities, vsmActivityData) {
    const dataByActivityUuid = this.indexBy(vsmActivityData, "activityUUID");
    const enrichedActivities = activities.map((activity) => {
      const vsm = dataByActivityUuid[activity.activityUUID] || {};
      const processTime = this.expectedTriangular(
        vsm.processTimeMin,
        vsm.processTimeLikely,
        vsm.processTimeMax
      );
      const waitTime = this.expectedTriangular(
        vsm.waitTimeMin,
        vsm.waitTimeLikely,
        vsm.waitTimeMax
      );
      const queueTime = this.expectedTriangular(
        vsm.queueTimeMin,
        vsm.queueTimeLikely,
        vsm.queueTimeMax
      );

      return {
        ...activity,
        valueClassification: vsm.valueClassification || "NNVA",
        processTime,
        waitTime,
        queueTime
      };
    });

    const processTimeTotal = this.sum(enrichedActivities.map((item) => item.processTime));
    const accumulatedWaitTime = this.sum(
      enrichedActivities.map((item) => item.waitTime + item.queueTime)
    );
    const leadTimeTotal = processTimeTotal + accumulatedWaitTime;
    const valueAddedTime = this.sum(
      enrichedActivities
        .filter((item) => item.valueClassification === "VA")
        .map((item) => item.processTime)
    );
    const necessaryNonValueAddedTime = this.sum(
      enrichedActivities
        .filter((item) => item.valueClassification === "NNVA")
        .map((item) => item.processTime)
    );
    const nonValueAddedTime = this.sum(
      enrichedActivities
        .filter((item) => item.valueClassification === "NVA")
        .map((item) => item.processTime)
    );

    return {
      leadTimeTotal,
      processTimeTotal,
      valueAddedTime,
      necessaryNonValueAddedTime,
      nonValueAddedTime,
      valueAddedPercentage: this.percentage(valueAddedTime, leadTimeTotal),
      nonValueAddedPercentage: this.percentage(nonValueAddedTime + accumulatedWaitTime, leadTimeTotal),
      handoffCount: this.countHandoffs(enrichedActivities),
      activityCount: enrichedActivities.length,
      responsibleCount: this.countDistinct(enrichedActivities.map((item) => item.responsibleRole)),
      accumulatedWaitTime
    };
  },

  countHandoffs(activities) {
    return activities.reduce((total, activity, index) => {
      if (index === 0) {
        return total;
      }

      const previous = activities[index - 1];
      return previous.responsibleRole !== activity.responsibleRole ? total + 1 : total;
    }, 0);
  },

  indexBy(records, key) {
    return records.reduce((index, record) => {
      index[record[key]] = record;
      return index;
    }, {});
  }
});

