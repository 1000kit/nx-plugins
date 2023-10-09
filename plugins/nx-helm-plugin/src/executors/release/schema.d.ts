export interface ReleaseExecutorSchema {
    registry?: string,
    chartName?: string,    
    push?: boolean,
    patchValuesYaml?: object,
    patchChartYaml?: object,    
} // eslint-disable-line
