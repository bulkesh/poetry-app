class Callback {}

/** Data data object */
declare interface Data {
    [propName: string]: string|number|boolean|undefined|[]|{}|Callback;
}

/** ApiResponse data object */
declare interface ApiResponse {
    [propName: string]: string[];
}

/** Authors API response data */
declare interface Authors {
    'authors': string[];
}

/** Title API response data */
declare interface Title {
    'title': string;
}

/** Title API response data */
declare interface TitleArray {
    'title': Title[];
}

/** Poetry API response data */
declare interface Poetry {
    'author': string;
    'title': string;
    'linecount': string;
    'lines': string[];
    'rhym'?: string;
    'rhymScheme'?:string;
    'status'?: number, 
    'reason'?: string,
}



export {
    Data,
    Authors,
    Title,
    TitleArray,
    ApiResponse,
    Poetry,
}