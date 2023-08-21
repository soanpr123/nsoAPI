import { readSms } from '@libs/readSms';
require('dotenv').config();

class ReadSmsConsumer {
  static readonly EXCHANGE_NAME = process.env.EXCHANGE_NAME;
  static readonly ROUTING_KEY = process.env.ROUTING_KEY;
  static readonly QUEUE_NAME = process.env.QUEUE_NAME;

  public async execute (connection: any) {
    try {
      console.log('Message listen');
      const channel = await connection.createChannel();
      await channel.assertExchange(ReadSmsConsumer.EXCHANGE_NAME, 'direct');
      await channel.assertQueue(ReadSmsConsumer.QUEUE_NAME);
      await channel.bindQueue(ReadSmsConsumer.QUEUE_NAME, ReadSmsConsumer.EXCHANGE_NAME, ReadSmsConsumer.ROUTING_KEY);
      await channel.consume(ReadSmsConsumer.QUEUE_NAME, async (message: any) => {
        const data = JSON.parse(message.content.toString());
        await readSms({ id: data.userId, apiKey: data.apiKey, merchantId: data.merchantId, typeTopup: data.typeTopup }, null, data.content, data.fromBank, data.phoneReceive);
        channel.ack(message);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default new ReadSmsConsumer();
