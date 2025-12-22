"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const moment = require("moment");
const getUser_decorator_1 = require("../auth/decorator/getUser.decorator");
const isAdmin_guard_1 = require("../auth/guard/isAdmin.guard");
const jwt_guard_1 = require("../auth/guard/jwt.guard");
const adminShare_dto_1 = require("./dto/adminShare.dto");
const createShare_dto_1 = require("./dto/createShare.dto");
const myShare_dto_1 = require("./dto/myShare.dto");
const share_dto_1 = require("./dto/share.dto");
const shareMetaData_dto_1 = require("./dto/shareMetaData.dto");
const sharePassword_dto_1 = require("./dto/sharePassword.dto");
const createShare_guard_1 = require("./guard/createShare.guard");
const shareOwner_guard_1 = require("./guard/shareOwner.guard");
const shareSecurity_guard_1 = require("./guard/shareSecurity.guard");
const shareTokenSecurity_guard_1 = require("./guard/shareTokenSecurity.guard");
const share_service_1 = require("./share.service");
const shareComplete_dto_1 = require("./dto/shareComplete.dto");
let ShareController = class ShareController {
    constructor(shareService, jwtService) {
        this.shareService = shareService;
        this.jwtService = jwtService;
    }
    async getAllShares() {
        return new adminShare_dto_1.AdminShareDTO().fromList(await this.shareService.getShares());
    }
    async getMyShares(user) {
        return new myShare_dto_1.MyShareDTO().fromList(await this.shareService.getSharesByUser(user.id));
    }
    async get(id) {
        return new share_dto_1.ShareDTO().from(await this.shareService.get(id));
    }
    async getFromOwner(id) {
        return new share_dto_1.ShareDTO().from(await this.shareService.get(id));
    }
    async getMetaData(id) {
        return new shareMetaData_dto_1.ShareMetaDataDTO().from(await this.shareService.getMetaData(id));
    }
    async create(body, request, user) {
        const { reverse_share_token } = request.cookies;
        return new share_dto_1.ShareDTO().from(await this.shareService.create(body, user, reverse_share_token));
    }
    async complete(id, request) {
        const { reverse_share_token } = request.cookies;
        return new shareComplete_dto_1.CompletedShareDTO().from(await this.shareService.complete(id, reverse_share_token));
    }
    async revertComplete(id) {
        return new share_dto_1.ShareDTO().from(await this.shareService.revertComplete(id));
    }
    async remove(id, user) {
        const isDeleterAdmin = user?.isAdmin === true;
        await this.shareService.remove(id, isDeleterAdmin);
    }
    async isShareIdAvailable(id) {
        return this.shareService.isShareIdAvailable(id);
    }
    async getShareToken(id, request, response, body) {
        const token = await this.shareService.getShareToken(id, body.password);
        this.clearShareTokenCookies(request, response);
        response.cookie(`share_${id}_token`, token, {
            path: "/",
            httpOnly: true,
        });
        return { token };
    }
    clearShareTokenCookies(request, response) {
        const shareTokenCookies = Object.entries(request.cookies)
            .filter(([key]) => key.startsWith("share_") && key.endsWith("_token"))
            .map(([key, value]) => ({
            key,
            payload: this.jwtService.decode(value),
        }));
        const expiredTokens = shareTokenCookies.filter((cookie) => cookie.payload.exp < moment().unix());
        const validTokens = shareTokenCookies.filter((cookie) => cookie.payload.exp >= moment().unix());
        expiredTokens.forEach((cookie) => response.clearCookie(cookie.key));
        if (validTokens.length > 10) {
            validTokens
                .sort((a, b) => a.payload.exp - b.payload.exp)
                .slice(0, -10)
                .forEach((cookie) => response.clearCookie(cookie.key));
        }
    }
};
exports.ShareController = ShareController;
__decorate([
    (0, common_1.Get)("all"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, isAdmin_guard_1.AdministratorGuard),
    openapi.ApiResponse({ status: 200, type: [require("./dto/adminShare.dto").AdminShareDTO] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getAllShares", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: [require("./dto/myShare.dto").MyShareDTO] }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getMyShares", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(shareSecurity_guard_1.ShareSecurityGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/share.dto").ShareDTO }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(":id/from-owner"),
    (0, common_1.UseGuards)(shareOwner_guard_1.ShareOwnerGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/share.dto").ShareDTO }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getFromOwner", null);
__decorate([
    (0, common_1.Get)(":id/metaData"),
    (0, common_1.UseGuards)(shareSecurity_guard_1.ShareSecurityGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/shareMetaData.dto").ShareMetaDataDTO }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getMetaData", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(createShare_guard_1.CreateShareGuard),
    openapi.ApiResponse({ status: 201, type: require("./dto/share.dto").ShareDTO }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createShare_dto_1.CreateShareDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/complete"),
    (0, common_1.HttpCode)(202),
    (0, common_1.UseGuards)(createShare_guard_1.CreateShareGuard, shareOwner_guard_1.ShareOwnerGuard),
    openapi.ApiResponse({ status: 202, type: require("./dto/shareComplete.dto").CompletedShareDTO }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(":id/complete"),
    (0, common_1.UseGuards)(shareOwner_guard_1.ShareOwnerGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/share.dto").ShareDTO }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "revertComplete", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(shareOwner_guard_1.ShareOwnerGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "remove", null);
__decorate([
    (0, throttler_1.Throttle)({
        default: {
            limit: 10,
            ttl: 60,
        },
    }),
    (0, common_1.Get)("isShareIdAvailable/:id"),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "isShareIdAvailable", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 5 * 60,
        },
    }),
    (0, common_1.UseGuards)(shareTokenSecurity_guard_1.ShareTokenSecurity),
    (0, common_1.Post)(":id/token"),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, sharePassword_dto_1.SharePasswordDto]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getShareToken", null);
exports.ShareController = ShareController = __decorate([
    (0, common_1.Controller)("shares"),
    __metadata("design:paramtypes", [share_service_1.ShareService,
        jwt_1.JwtService])
], ShareController);
//# sourceMappingURL=share.controller.js.map