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
exports.UserController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const getUser_decorator_1 = require("../auth/decorator/getUser.decorator");
const isAdmin_guard_1 = require("../auth/guard/isAdmin.guard");
const jwt_guard_1 = require("../auth/guard/jwt.guard");
const config_service_1 = require("../config/config.service");
const createUser_dto_1 = require("./dto/createUser.dto");
const updateOwnUser_dto_1 = require("./dto/updateOwnUser.dto");
const updateUser_dto_1 = require("./dto/updateUser.dto");
const user_dto_1 = require("./dto/user.dto");
const user_service_1 = require("./user.service");
let UserController = class UserController {
    constructor(userService, config) {
        this.userService = userService;
        this.config = config;
    }
    async getCurrentUser(user) {
        if (!user)
            return null;
        const userDTO = new user_dto_1.UserDTO().from(user);
        userDTO.hasPassword = !!user.password;
        return userDTO;
    }
    async updateCurrentUser(user, data) {
        return new user_dto_1.UserDTO().from(await this.userService.update(user.id, data));
    }
    async deleteCurrentUser(user, response) {
        await this.userService.delete(user.id);
        const isSecure = this.config.get("general.secureCookies");
        response.cookie("access_token", "accessToken", {
            maxAge: -1,
            secure: isSecure,
        });
        response.cookie("refresh_token", "", {
            path: "/api/auth/token",
            httpOnly: true,
            maxAge: -1,
            secure: isSecure,
        });
    }
    async list() {
        return new user_dto_1.UserDTO().fromList(await this.userService.list());
    }
    async create(user) {
        return new user_dto_1.UserDTO().from(await this.userService.create(user));
    }
    async update(id, user) {
        return new user_dto_1.UserDTO().from(await this.userService.update(id, user));
    }
    async delete(id) {
        return new user_dto_1.UserDTO().from(await this.userService.delete(id));
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserDTO }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Patch)("me"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserDTO }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, updateOwnUser_dto_1.UpdateOwnUserDTO]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateCurrentUser", null);
__decorate([
    (0, common_1.Delete)("me"),
    (0, common_1.HttpCode)(204),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 204 }),
    __param(0, (0, getUser_decorator_1.GetUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteCurrentUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, isAdmin_guard_1.AdministratorGuard),
    openapi.ApiResponse({ status: 200, type: [require("./dto/user.dto").UserDTO] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, isAdmin_guard_1.AdministratorGuard),
    openapi.ApiResponse({ status: 201, type: require("./dto/user.dto").UserDTO }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createUser_dto_1.CreateUserDTO]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, isAdmin_guard_1.AdministratorGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserDTO }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, updateUser_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, isAdmin_guard_1.AdministratorGuard),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserDTO }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)("users"),
    __metadata("design:paramtypes", [user_service_1.UserSevice,
        config_service_1.ConfigService])
], UserController);
//# sourceMappingURL=user.controller.js.map