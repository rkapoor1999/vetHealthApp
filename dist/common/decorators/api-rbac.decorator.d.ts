export declare function ApiRbac(operation: string, resource: string, options?: {
    summary?: string;
    description?: string;
    tags?: string[];
}): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
