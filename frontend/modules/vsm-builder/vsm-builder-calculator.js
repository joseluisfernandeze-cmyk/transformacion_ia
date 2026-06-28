window.VsmBuilderCalculator = Object.freeze({
  calculate(processModel, vsmMap) {
    return window.CalculationEngine.calculateVsmMetrics(
      processModel.activities,
      vsmMap.activityData
    );
  }
});

