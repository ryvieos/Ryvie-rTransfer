import { ShareDTO } from "./share.dto";
import { FileDTO } from "../../file/dto/file.dto";
import { MyShareSecurityDTO } from "./myShareSecurity.dto";
declare const MyShareDTO_base: import("@nestjs/common").Type<Omit<ShareDTO, "files" | "from" | "fromList">>;
export declare class MyShareDTO extends MyShareDTO_base {
    views: number;
    createdAt: Date;
    recipients: string[];
    files: Omit<FileDTO, "share" | "from">[];
    security?: MyShareSecurityDTO;
    from(partial: Partial<MyShareDTO>): MyShareDTO;
    fromList(partial: Partial<MyShareDTO>[]): MyShareDTO[];
}
export {};
