// Error Messages Constants
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng thử lại.',
    REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
    INVALID_EMAIL: 'Email không hợp lệ',
    PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự',
    PASSWORD_UPPERCASE: 'Mật khẩu phải có ít nhất 1 chữ hoa',
    PASSWORD_NUMBER: 'Mật khẩu phải có ít nhất 1 số',
    UNAUTHORIZED: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
  },
  CART: {
    ADD_FAILED: 'Thêm vào giỏ hàng thất bại',
    UPDATE_FAILED: 'Cập nhật giỏ hàng thất bại',
    REMOVE_FAILED: 'Xóa sản phẩm thất bại',
    EMPTY_CART: 'Giỏ hàng trống'
  },
  CHECKOUT: {
    STOCK_UNAVAILABLE: 'Sản phẩm đã hết hàng',
    PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại.',
    ORDER_FAILED: 'Đặt hàng thất bại. Vui lòng thử lại.'
  },
  PRESCRIPTION: {
    INVALID_SPH: 'Thông số SPH không hợp lệ (-20.00 đến +20.00)',
    INVALID_CYL: 'Thông số CYL không hợp lệ (-6.00 đến +6.00)',
    INVALID_AXIS: 'Thông số AXIS không hợp lệ (1 đến 180)',
    INVALID_PD: 'Thông số PD không hợp lệ (50 đến 80)',
    AXIS_REQUIRED: 'AXIS bắt buộc khi CYL khác 0'
  },
  PRODUCT: {
    NOT_FOUND: 'Không tìm thấy sản phẩm',
    INVALID_PRICE: 'Giá sản phẩm không hợp lệ',
    LOAD_FAILED: 'Lỗi tải sản phẩm',
    CREATE_FAILED: 'Tạo sản phẩm thất bại',
    UPDATE_FAILED: 'Cập nhật sản phẩm thất bại',
    DELETE_FAILED: 'Xóa sản phẩm thất bại'
  },
  HTTP: {
    BAD_REQUEST: 'Yêu cầu không hợp lệ',
    FORBIDDEN: 'Bạn không có quyền truy cập',
    NOT_FOUND: 'Không tìm thấy dữ liệu',
    CONFLICT: 'Dữ liệu đã tồn tại',
    UNPROCESSABLE: 'Dữ liệu không hợp lệ',
    TOO_MANY_REQUESTS: 'Quá nhiều yêu cầu. Vui lòng thử lại sau',
    SERVICE_UNAVAILABLE: 'Hệ thống đang bảo trì. Vui lòng thử lại sau'
  },
  GENERAL: {
    SUCCESS: 'Thành công',
    NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
    SERVER_ERROR: 'Lỗi hệ thống. Vui lòng thử lại sau.',
    UNKNOWN_ERROR: 'Đã xảy ra lỗi. Vui lòng thử lại.'
  }
} as const


// Success Messages Constants
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công'
  },
  CART: {
    ADDED: 'Đã thêm vào giỏ hàng',
    UPDATED: 'Đã cập nhật giỏ hàng',
    REMOVED: 'Đã xóa sản phẩm'
  },
  CHECKOUT: {
    ORDER_SUCCESS: 'Đặt hàng thành công'
  }
} as const
