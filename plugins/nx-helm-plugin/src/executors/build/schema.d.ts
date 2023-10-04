export interface BuildExecutorSchema {
    registry?: string
    chartName?: string
    push?: boolean,
    version?: string,
    dir?: 'helm',    
    patchValuesYaml?: object
    patchChartYaml?: object
} // eslint-disable-line
