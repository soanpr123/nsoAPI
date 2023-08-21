import RabbitMQ from '@initializers/rabbitMQConnection';
require('dotenv').config();

class SendReadSms {
  static readonly EXCHANGE_NAME = process.env.EXCHANGE_NAME;
  static readonly ROUTING_KEY = process.env.ROUTING_KEY;
  static readonly QUEUE_NAME = process.env.QUEUE_NAME;

  public async singleSms (userId: string, apiKey: string, merchantId: string, typeTopup:string, content: string, fromBank: string, phoneReceive: string) {
    try {
      const connection = RabbitMQ.connection;
      const channel = await (await connection).createChannel();
      await channel.assertExchange(SendReadSms.EXCHANGE_NAME, 'direct');
      await channel.assertQueue(SendReadSms.QUEUE_NAME);

      const msg: any = {
        userId,
        apiKey,
        merchantId,
        typeTopup,
        content,
        fromBank,
        phoneReceive,
      };
      channel.sendToQueue(SendReadSms.QUEUE_NAME, Buffer.from(JSON.stringify(msg)));
      return channel.close();
    } catch (error) {
      console.log(error);
    }
  }
}

export default new SendReadSms();
