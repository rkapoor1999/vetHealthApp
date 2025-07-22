import { CommandRunner } from 'nest-commander';
import { SeedService } from './seed.service';
export declare class SeedCommand extends CommandRunner {
    private readonly seedService;
    constructor(seedService: SeedService);
    run(): Promise<void>;
}
