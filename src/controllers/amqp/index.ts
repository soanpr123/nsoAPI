import ReadSmsConsumer from './ReadSmsConsumer';

export default async (connection: any) => {
  await ReadSmsConsumer.execute(connection);
};
