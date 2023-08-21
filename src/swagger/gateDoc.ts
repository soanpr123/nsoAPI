import swaggerJsDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const swaggerDefinition = {
  info: {
    title: 'API document',
    version: '1.0.0',
    description: `Các API được bảo mật bằng API Key do bên phía hệ thống cung cấp. ApiKey được gắn vào Header Request với Name: Authorization.
    
    Quy trình Nạp: 
    - Cổng đối tác tạo yêu cầu nạp và gọi tạo yêu cầu nạp bên phía chúng tôi. 
    - User chuyển tiền vào bank theo đúng thông tin yêu cầu nạp và số tiền nạp. 
    - Chúng tôi tự động xác nhận yêu cầu thành công nếu nội dung chuyển khoản chính xác và số tiền chính xác. 
    - Chúng tôi tự động gọi callback sang đối tác để xác nhận yêu cầu nạp thành công. 
    - Nếu nội dung chuyển khoản hoặc số tiền chuyển không đúng thì yêu cầu nạp sẽ treo trạng thái đang chờ.
    Callback mẫu:
    - Method: 'post'
    - Content-Type: 'application/json'
    - Body: {
      code: 0,
      message: 'success',
      data: {
        callbackType: 'topup',
        partnerReference: 'Nickname user',
        requestId: 'requestId từ phía đối tác',
        chargeType: 'bank',
        requestAmount: 'Số tiền yêu cầu nạp',
        transferAmount: 'Số tiền nạp thực tế',
        status: 'success',
      },
    }
    Code lỗi:
    - 0: không có lỗi
    - 1: hủy yêu cầu nạp
    
    Quy trình Rút: 
    - Cổng đối tác tạo yêu cầu rút và gọi tạo yêu cầu rút bên phía chúng tôi. 
    - Chúng tôi chuyển khoản theo đúng yêu cầu rút. 
    - Sau khi hoàn thành sẽ gọi callback về cổng đối tác để cập nhật yêu cầu rút thành công hoặc thất bại.
    Callback mẫu:
    - Method: 'post'
    - Content-Type: 'application/json'
    - Body: {
      code: 0,
      message: 'success',
      data: {
        callbackType: 'withdraw',
        partnerReference: 'Nickname user',
        requestId: 'requestId từ phía đối tác',
        chargeType: 'bank',
        transferAmount: 'Số tiền rút thực tế',
        status: 'success',
      },
    }
    Code lỗi:
    - 0: không có lỗi
    - 1: hủy yêu cầu rút
    - 2: chuyển tiền thất bại
    - 3: tài khoản nhận sai thông tin
    - 4: tài khoản không đủ tiền

    Lưu ý: 
    - Chúng tôi chỉ nhận nạp qua các ngân hàng được active trong danh sách ngân hàng nạp.
    - Nickname chỉ bao gồm các kí tự A-Z, a-z, 0-9
    - Nội dung chuyển khoản để nạp cần quy định tiền tố cố định. VD: NAP-nickname hoặc COC-nickname. Cần thông báo cho chúng tôi phần tiền tố này.
    `,
  },
  host: process.env.APP_URL,
  basePath: '/gate',
  tags: [
    {
      name: '[GATE] Danh sách tài khoản Bank nạp',
    },
  ],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      schema: 'string',
      name: 'Authorization',
      in: 'header',
      prefix: 'Bearer ',
    },
  },
  definitions: {},
};

const options = {
  swaggerDefinition,
  explorer: true,
  apis: ['**/configs/routes/gate/*.ts'],
};
export default swaggerJsDoc(options);
