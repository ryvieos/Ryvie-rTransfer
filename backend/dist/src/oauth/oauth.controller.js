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
exports.OAuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const nanoid_1 = require("nanoid");
const auth_service_1 = require("../auth/auth.service");
const getUser_decorator_1 = require("../auth/decorator/getUser.decorator");
const jwt_guard_1 = require("../auth/guard/jwt.guard");
const config_service_1 = require("../config/config.service");
const oauthCallback_dto_1 = require("./dto/oauthCallback.dto");
const errorPageException_filter_1 = require("./filter/errorPageException.filter");
const oauth_guard_1 = require("./guard/oauth.guard");
const provider_guard_1 = require("./guard/provider.guard");
const oauth_service_1 = require("./oauth.service");
const oauthException_filter_1 = require("./filter/oauthException.filter");
let OAuthController = class OAuthController {
    constructor(authService, oauthService, config, providers) {
        this.authService = authService;
        this.oauthService = oauthService;
        this.config = config;
        this.providers = providers;
    }
    available() {
        return this.oauthService.available();
    }
    async status(user) {
        return this.oauthService.status(user);
    }
    async auth(provider, response) {
        const state = (0, nanoid_1.nanoid)(16);
        const url = await this.providers[provider].getAuthEndpoint(state);
        response.cookie(`oauth_${provider}_state`, state, { sameSite: "lax" });
        response.redirect(url);
    }
    async callback(provider, query, request, response) {
        const oauthToken = await this.providers[provider].getToken(query);
        const user = await this.providers[provider].getUserInfo(oauthToken, query);
        const id = await this.authService.getIdOfCurrentUser(request);
        if (id) {
            await this.oauthService.link(id, provider, user.providerId, user.providerUsername);
            response.redirect(this.config.get("general.appUrl") + "/account");
        }
        else {
            const token = await this.oauthService.signIn(user, request.ip);
            if (token.accessToken) {
                this.authService.addTokensToResponse(response, token.refreshToken, token.accessToken);
                response.redirect(this.config.get("general.appUrl"));
            }
            else {
                response.redirect(this.config.get("general.appUrl") + `/auth/totp/${token.loginToken}`);
            }
        }
    }
    unlink(user, provider) {
        return this.oauthService.unlink(user, provider);
    }
};
exports.OAuthController = OAuthController;
__decorate([
    (0, common_1.Get)("available"),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OAuthController.prototype, "available", null);
__decorate([
    (0, common_1.Get)("status"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "status", null);
__decorate([
    (0, common_1.Get)("auth/:provider"),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    (0, common_1.UseFilters)(errorPageException_filter_1.ErrorPageExceptionFilter),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("provider")),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "auth", null);
__decorate([
    (0, common_1.Get)("callback/:provider"),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard, oauth_guard_1.OAuthGuard),
    (0, common_1.UseFilters)(errorPageException_filter_1.ErrorPageExceptionFilter, oauthException_filter_1.OAuthExceptionFilter),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("provider")),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, oauthCallback_dto_1.OAuthCallbackDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)("unlink/:provider"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, provider_guard_1.ProviderGuard),
    (0, common_1.UseFilters)(errorPageException_filter_1.ErrorPageExceptionFilter),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)("provider")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OAuthController.prototype, "unlink", null);
exports.OAuthController = OAuthController = __decorate([
    (0, common_1.Controller)("oauth"),
    __param(3, (0, common_1.Inject)("OAUTH_PROVIDERS")),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        oauth_service_1.OAuthService,
        config_service_1.ConfigService, Object])
], OAuthController);
//# sourceMappingURL=oauth.controller.js.map