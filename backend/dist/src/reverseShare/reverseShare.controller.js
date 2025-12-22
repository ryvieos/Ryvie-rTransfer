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
exports.ReverseShareController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const getUser_decorator_1 = require("../auth/decorator/getUser.decorator");
const jwt_guard_1 = require("../auth/guard/jwt.guard");
const config_service_1 = require("../config/config.service");
const createReverseShare_dto_1 = require("./dto/createReverseShare.dto");
const reverseShare_dto_1 = require("./dto/reverseShare.dto");
const reverseShareTokenWithShares_1 = require("./dto/reverseShareTokenWithShares");
const reverseShareOwner_guard_1 = require("./guards/reverseShareOwner.guard");
const reverseShare_service_1 = require("./reverseShare.service");
let ReverseShareController = class ReverseShareController {
    constructor(reverseShareService, config) {
        this.reverseShareService = reverseShareService;
        this.config = config;
    }
    async create(body, user) {
        const token = await this.reverseShareService.create(body, user.id);
        const link = `${this.config.get("general.appUrl")}/upload/${token}`;
        return { token, link };
    }
    async getByToken(reverseShareToken) {
        const isValid = await this.reverseShareService.isValid(reverseShareToken);
        if (!isValid)
            throw new common_1.NotFoundException("Reverse share token not found");
        return new reverseShare_dto_1.ReverseShareDTO().from(await this.reverseShareService.getByToken(reverseShareToken));
    }
    async getAllByUser(user) {
        return new reverseShareTokenWithShares_1.ReverseShareTokenWithShares().fromList(await this.reverseShareService.getAllByUser(user.id));
    }
    async remove(id) {
        await this.reverseShareService.remove(id);
    }
};
exports.ReverseShareController = ReverseShareController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createReverseShare_dto_1.CreateReverseShareDTO, Object]),
    __metadata("design:returntype", Promise)
], ReverseShareController.prototype, "create", null);
__decorate([
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 60,
        },
    }),
    (0, common_1.Get)(":reverseShareToken"),
    openapi.ApiResponse({ status: 200, type: require("./dto/reverseShare.dto").ReverseShareDTO }),
    __param(0, (0, common_1.Param)("reverseShareToken")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReverseShareController.prototype, "getByToken", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: [require("./dto/reverseShareTokenWithShares").ReverseShareTokenWithShares] }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReverseShareController.prototype, "getAllByUser", null);
__decorate([
    (0, common_1.Delete)(":reverseShareId"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, reverseShareOwner_guard_1.ReverseShareOwnerGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("reverseShareId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReverseShareController.prototype, "remove", null);
exports.ReverseShareController = ReverseShareController = __decorate([
    (0, common_1.Controller)("reverseShares"),
    __metadata("design:paramtypes", [reverseShare_service_1.ReverseShareService,
        config_service_1.ConfigService])
], ReverseShareController);
//# sourceMappingURL=reverseShare.controller.js.map