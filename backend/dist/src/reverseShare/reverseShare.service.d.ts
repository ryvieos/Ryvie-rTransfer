import { ConfigService } from "src/config/config.service";
import { FileService } from "src/file/file.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateReverseShareDTO } from "./dto/createReverseShare.dto";
export declare class ReverseShareService {
    private config;
    private prisma;
    private fileService;
    constructor(config: ConfigService, prisma: PrismaService, fileService: FileService);
    create(data: CreateReverseShareDTO, creatorId: string): Promise<string>;
    getByToken(reverseShareToken?: string): Promise<{
        id: string;
        createdAt: Date;
        creatorId: string;
        token: string;
        shareExpiration: Date;
        maxShareSize: string;
        sendEmailNotification: boolean;
        remainingUses: number;
        simplified: boolean;
        publicAccess: boolean;
    }>;
    getAllByUser(userId: string): Promise<({
        shares: ({
            creator: {
                updatedAt: Date;
                email: string;
                username: string;
                password: string | null;
                id: string;
                createdAt: Date;
                isAdmin: boolean;
                ldapDN: string | null;
                totpEnabled: boolean;
                totpVerified: boolean;
                totpSecret: string | null;
            };
        } & {
            name: string | null;
            id: string;
            createdAt: Date;
            uploadLocked: boolean;
            isZipReady: boolean;
            views: number;
            expiration: Date;
            description: string | null;
            removedReason: string | null;
            creatorId: string | null;
            reverseShareId: string | null;
            storageProvider: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        creatorId: string;
        token: string;
        shareExpiration: Date;
        maxShareSize: string;
        sendEmailNotification: boolean;
        remainingUses: number;
        simplified: boolean;
        publicAccess: boolean;
    })[]>;
    isValid(reverseShareToken: string): Promise<boolean>;
    remove(id: string): Promise<void>;
}
