export declare class AppController {
    getRoot(): {
        message: string;
        version: string;
        documentation: string;
        timestamp: string;
    };
    getHealth(): {
        status: string;
        timestamp: string;
    };
}
