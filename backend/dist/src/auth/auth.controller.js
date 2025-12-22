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
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const config_service_1 = require("../config/config.service");
const auth_service_1 = require("./auth.service");
const authTotp_service_1 = require("./authTotp.service");
const getUser_decorator_1 = require("./decorator/getUser.decorator");
const authRegister_dto_1 = require("./dto/authRegister.dto");
const authSignIn_dto_1 = require("./dto/authSignIn.dto");
const authSignInTotp_dto_1 = require("./dto/authSignInTotp.dto");
const enableTotp_dto_1 = require("./dto/enableTotp.dto");
const resetPassword_dto_1 = require("./dto/resetPassword.dto");
const token_dto_1 = require("./dto/token.dto");
const updatePassword_dto_1 = require("./dto/updatePassword.dto");
const verifyTotp_dto_1 = require("./dto/verifyTotp.dto");
const jwt_guard_1 = require("./guard/jwt.guard");
let AuthController = class AuthController {
    constructor(authService, authTotpService, config) {
        this.authService = authService;
        this.authTotpService = authTotpService;
        this.config = config;
    }
    async signUp(dto, { ip }, response) {
        if (!this.config.get("share.allowRegistration"))
            throw new common_1.ForbiddenException("Registration is not allowed");
        const result = await this.authService.signUp(dto, ip);
        this.authService.addTokensToResponse(response, result.refreshToken, result.accessToken);
        return result;
    }
    async signIn(dto, { ip }, response) {
        const result = await this.authService.signIn(dto, ip);
        if (result.accessToken && result.refreshToken) {
            this.authService.addTokensToResponse(response, result.refreshToken, result.accessToken);
        }
        return result;
    }
    async signInTotp(dto, response) {
        const result = await this.authTotpService.signInTotp(dto);
        this.authService.addTokensToResponse(response, result.refreshToken, result.accessToken);
        return new token_dto_1.TokenDTO().from(result);
    }
    async requestResetPassword(email) {
        await this.authService.requestResetPassword(email);
    }
    async resetPassword(dto) {
        return await this.authService.resetPassword(dto.token, dto.password);
    }
    async updatePassword(user, response, dto) {
        const result = await this.authService.updatePassword(user, dto.password, dto.oldPassword);
        this.authService.addTokensToResponse(response, result.refreshToken);
        return new token_dto_1.TokenDTO().from(result);
    }
    async refreshAccessToken(request, response) {
        if (!request.cookies.refresh_token)
            throw new common_1.UnauthorizedException();
        const accessToken = await this.authService.refreshAccessToken(request.cookies.refresh_token);
        this.authService.addTokensToResponse(response, undefined, accessToken);
        return new token_dto_1.TokenDTO().from({ accessToken });
    }
    async signOut(request, response) {
        const redirectURI = await this.authService.signOut(request.cookies.access_token);
        const isSecure = this.config.get("general.secureCookies");
        response.cookie("access_token", "", {
            maxAge: -1,
            secure: isSecure,
        });
        response.cookie("refresh_token", "", {
            path: "/api/auth/token",
            httpOnly: true,
            maxAge: -1,
            secure: isSecure,
        });
        if (typeof redirectURI === "string") {
            return { redirectURI: redirectURI.toString() };
        }
    }
    async enableTotp(user, body) {
        return this.authTotpService.enableTotp(user, body.password);
    }
    async verifyTotp(user, body) {
        return this.authTotpService.verifyTotp(user, body.password, body.code);
    }
    async disableTotp(user, body) {
        return this.authTotpService.disableTotp(user, body.password, body.code);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("signUp"),
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 5 * 60,
        },
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authRegister_dto_1.AuthRegisterDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)("signIn"),
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 5 * 60,
        },
    }),
    (0, common_1.HttpCode)(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authSignIn_dto_1.AuthSignInDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)("signIn/totp"),
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 5 * 60,
        },
    }),
    (0, common_1.HttpCode)(200),
    openapi.ApiResponse({ status: 200, type: require("./dto/token.dto").TokenDTO }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authSignInTotp_dto_1.AuthSignInTotpDTO, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signInTotp", null);
__decorate([
    (0, common_1.Post)("resetPassword/:email"),
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 5 * 60,
        },
    }),
    (0, common_1.HttpCode)(202),
    openapi.ApiResponse({ status: 202 }),
    __param(0, (0, common_1.Param)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestResetPassword", null);
__decorate([
    (0, common_1.Post)("resetPassword"),
    (0, throttler_1.Throttle)({
        default: {
            limit: 20,
            ttl: 5 * 60,
        },
    }),
    (0, common_1.HttpCode)(204),
    openapi.ApiResponse({ status: 204 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetPassword_dto_1.ResetPasswordDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Patch)("password"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/token.dto").TokenDTO }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, updatePassword_dto_1.UpdatePasswordDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Post)("token"),
    (0, common_1.HttpCode)(200),
    openapi.ApiResponse({ status: 200, type: require("./dto/token.dto").TokenDTO }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshAccessToken", null);
__decorate([
    (0, common_1.Post)("signOut"),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOut", null);
__decorate([
    (0, common_1.Post)("totp/enable"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, enableTotp_dto_1.EnableTotpDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableTotp", null);
__decorate([
    (0, common_1.Post)("totp/verify"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 201, type: Boolean }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verifyTotp_dto_1.VerifyTotpDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTotp", null);
__decorate([
    (0, common_1.Post)("totp/disable"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 201, type: Boolean }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verifyTotp_dto_1.VerifyTotpDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disableTotp", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        authTotp_service_1.AuthTotpService,
        config_service_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map