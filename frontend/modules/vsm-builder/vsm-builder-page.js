window.VsmBuilderPage = Object.freeze({
  render() {
    const processModel = window.VsmBuilderState.processModel;
    const vsmMap = window.VsmBuilderState.vsmMap;
    const metrics = window.VsmBuilderCalculator.calculate(processModel, vsmMap);

    return window.VsmBuilderRenderer.renderCanvas(processModel, vsmMap, metrics);
  }
});

