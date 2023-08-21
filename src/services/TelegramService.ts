import { cleanSmsContent, readSms } from '@libs/readSms';
import SmsErrorLogModel from '@models/smsErrorLogs';
import SmsLogModel from '@models/smsLogs';
import UserModel from '@models/users';
import TelegramBot from 'node-telegram-bot-api';
import { Op } from 'sequelize';

export const ListenMessage = () => {
  const token = '5006252036:AAHzaFqlWJYX9UVw4m_BXqQcIxHPlOtGR6M';
  const bot = new TelegramBot(token, { polling: true });
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const user = await UserModel.findOne({
     
    });
    if (!user) {
      const opts: any = {
        parse_mode: 'markdown',
        reply_markup: {
          keyboard: [
            [{ text: 'CHIA SẺ SỐ ĐIỆN THOẠI', request_contact: true }],
          ],
          resize_keyboard: true,
        },
      };
      bot.sendMessage(chatId, 'Người dùng chưa đăng kí. Vui lòng báo cáo quản trị viên! Và ấn CHIA SẺ SỐ ĐIỆN THOẠI', opts);
      return;
    }
    const smsContent = cleanSmsContent(msg.text);
    try {
      const existSms = await SmsLogModel.findOne({
        where: {
          transferMessage: {
            [Op.like]: smsContent.slice(0, 70) + '%',
          },
        },
      });
      if (existSms) {
        return bot.sendMessage(chatId, 'Tin nhắn bị loại do trùng');
      } else {
        readSms(user, msg.text, 'BOT', 'BOT');
        bot.sendMessage(chatId, 'Ghi nhận tin!');
      }
    } catch (error) {
      const newSms: any = {
        UserId: user.id,
        transferMessage: smsContent,
      };
      SmsErrorLogModel.create(newSms);
    }
  });
};
