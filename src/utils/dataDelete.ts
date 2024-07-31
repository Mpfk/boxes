import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const existingData = async (): Promise<any[]> => {
  try {
    const data = await client.models.Boxes.list();
    console.log('Existing data retrieved:', data);
    return data.data || []; // Adjust to match the actual structure of the response
  } catch (error) {
    console.error('Error fetching existing data:', error);
    return [];
  }
};

export const deleteData = async (
  updateProgress: (progress: number) => void,
  updateStatus: (message: string) => void
): Promise<void> => {
  const items = await existingData();
  const totalItems = items.length;
  let deletedItems = 0;

  for (const item of items) {
    const { boxID, itemID } = item;
    try {
      console.log('Attempting to delete item:', item);
      await client.models.Boxes.delete({ boxID, itemID });
      deletedItems++;
      updateProgress((deletedItems / totalItems) * 100);
    } catch (error) {
      console.error('Error deleting item:', error);
      updateStatus(`Error deleting item ${boxID} - ${itemID}: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  }

  updateStatus('All items deleted successfully');
};
