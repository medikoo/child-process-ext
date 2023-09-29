import { SpawnOptions } from "child_process";

declare function spawn(command: string, args: Array<string>, options: SpawnOptions)
export default spawn