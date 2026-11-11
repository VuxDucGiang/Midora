package com.midora.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email này đã được đăng ký tài khoản"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để tiếp tục"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy tài khoản người dùng"),
    BODY_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "BODY_PROFILE_NOT_FOUND", "Không tìm thấy hồ sơ số đo cơ thể"),
    CONCURRENT_MODIFICATION(HttpStatus.CONFLICT, "CONCURRENT_MODIFICATION", "Dữ liệu vừa được cập nhật bởi người dùng khác, vui lòng thử lại"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Đã xảy ra lỗi hệ thống");

    private final HttpStatus status;
    private final String code;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String code, String defaultMessage) {
        this.status = status;
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}

