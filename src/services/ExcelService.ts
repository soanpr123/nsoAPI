import dayjs from 'dayjs';
import XLSX from 'xlsx';

class ExcelService {
  public static async listSmsLogs (data: any) {
    const result = data.map((record: any) => {
      const recordValue: any = Object.values(record)[0];
      return {
        'STT': recordValue?.id,
        'Ngân hàng': recordValue?.bankAcc.bankName,
        'Số TK': recordValue?.bankAcc.bankAccNumber,
        'Chủ TK': recordValue?.bankAcc.bankAccName,
        'Tin nhắn': recordValue?.transferMessage,
        'Tiền': recordValue?.transferAmount,
        'Trạng thái': recordValue?.status,
        'Callback': recordValue?.statusCallBack,
        'Thời gian tạo': dayjs(recordValue?.createdAt).format('DD/MM/YY hh:mm:ss'),
        'Thời gian xử lý': dayjs(recordValue?.updatedAt).format('DD/MM/YY hh:mm:ss'),
      };
    });
    return await ExcelService.exportToExcel(result);
  }

  public static async listWithdrawLogs (data: any) {
    const result = data.map((record: any) => {
      const recordValue: any = Object.values(record)[0];
      return {
        'ID': recordValue?.id,
        'Ngân hàng': recordValue?.Bank.bankName,
        'Số TK': recordValue?.bankAccNumber,
        'Chủ TK': recordValue?.bankAccName,
        'Tên nhân vật': recordValue?.partnerReference,
        'Tin nhắn': recordValue?.transferMessage,
        'Tiền': recordValue?.transferAmount,
        'Trạng thái': recordValue?.status,
        'Callback': recordValue?.statusCallBack,
        'Đã chuyển': recordValue?.statusTransfer,
        'Thời gian tạo': dayjs(recordValue?.createdAt).format('DD/MM/YY hh:mm:ss'),
        'Thời gian xử lý': dayjs(recordValue?.updatedAt).format('DD/MM/YY hh:mm:ss'),
      };
    });
    return await ExcelService.exportToExcel(result);
  }

  public static async listTopupLogs (data: any) {
    const result = data.map((record: any) => {
      const recordValue: any = Object.values(record)[0];
      return {
        'ID': recordValue?.id,
        'Ngân hàng': recordValue?.AccBank.BankInfo.bankName,
        'Số TK': recordValue?.AccBank.bankAccNumber,
        'Chủ TK': recordValue?.AccBank.bankAccName,
        'Tin nhắn': recordValue?.transferMessage,
        'Tên nhân vật': recordValue?.partnerReference,
        'Tiền thực nạp': recordValue?.transferAmount,
        'Tiền yêu cầu nạp': recordValue?.requestAmount,
        'Trạng thái': recordValue?.status,
        'Callback': recordValue?.statusCallBack,
        'Đã nhận': recordValue?.statusTransfer,
        'Thời gian tạo': dayjs(recordValue?.createdAt).format('DD/MM/YY hh:mm:ss'),
        'Thời gian xử lý': dayjs(recordValue?.updatedAt).format('DD/MM/YY hh:mm:ss'),
      };
    });
    return await ExcelService.exportToExcel(result);
  }

  public static async listTopupSms (data: any) {
    const result = data.map((record: any) => {
      const recordValue: any = Object.values(record)[0];
      return {
        'Mã tin': recordValue?.id,
        'Ngân hàng': recordValue?.Bank?.bankName,
        'Tin nhắn': recordValue?.content,
        'Tiền nạp': recordValue?.transferAmount,
        'Nội dung': recordValue?.partnerReference,
        'Trạng thái': recordValue?.status,
        'Mã giao dịch': recordValue?.TopupRequest?.requestId,
        'Thời gian nhận': dayjs(recordValue?.createdAt).format('DD/MM/YY hh:mm:ss'),
        'Thời gian xử lý': dayjs(recordValue?.updatedAt).format('DD/MM/YY hh:mm:ss'),
      };
    });
    return await ExcelService.exportToExcel(result);
  }

  public static async listWithdrawSms (data: any) {
    const result = data.map((record: any) => {
      const recordValue: any = Object.values(record)[0];
      return {
        'Mã tin': recordValue?.id,
        'Ngân hàng': recordValue?.Bank?.bankName,
        'Tin nhắn': recordValue?.content,
        'Tiền nạp': recordValue?.transferAmount,
        'Nội dung': recordValue?.partnerReference,
        'Trạng thái': recordValue?.status,
        'Mã giao dịch': recordValue?.WithdrawRequest?.requestId,
        'Thời gian nhận': dayjs(recordValue?.createdAt).format('DD/MM/YY hh:mm:ss'),
        'Thời gian xử lý': dayjs(recordValue?.updatedAt).format('DD/MM/YY hh:mm:ss'),
      };
    });
    return await ExcelService.exportToExcel(result);
  }

  private static async exportToExcel (data: any) {
    const workBook = XLSX.utils.book_new();
    const workSheetData = [
      ...data,
    ];
    const workSheet = XLSX.utils.json_to_sheet(workSheetData);
    XLSX.utils.book_append_sheet(workBook, workSheet);
    return workBook;
  }
}

export default ExcelService;
