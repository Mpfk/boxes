import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const listAllItems = async (): Promise<Schema['Boxes']["type"][]> => {
  let allItems: Schema['Boxes']["type"][] = [];
  let nextToken: string | null = null;

  try {
    do {
      const data: { data?: Schema['Boxes']["type"][]; nextToken?: string | null } = await client.models.Boxes.list({ nextToken });
      console.log('Existing data retrieved:', data);
      allItems = allItems.concat(data.data || []);
      nextToken = data.nextToken || null;
    } while (nextToken);

    return allItems;
  } catch (error) {
    console.error('Error fetching existing data:', error);
    return [];
  }
};

export const deleteData = async (
  updateProgress: (progress: number) => void,
  updateStatus: (message: string) => void
): Promise<void> => {
  const items = await listAllItems();
  const totalItems = items.length;
  let deletedItems = 0;
  let failedItems = 0;

  if (totalItems === 0) {
    updateStatus('No items to delete.');
    return;
  }

  for (const item of items) {
    const { boxID, itemID } = item;
    try {
      console.log('Attempting to delete item:', item);
      const result = await client.models.Boxes.delete({ boxID, itemID });
      console.log('Delete result:', result);
      if (result && result.data) {
        deletedItems++;
      } else {
        console.error('Failed to delete item:', item);
        failedItems++;
      }
      updateProgress((deletedItems + failedItems) / totalItems * 100);
    } catch (error) {
      console.error('Error deleting item:', error);
      updateStatus(`Error deleting item ${boxID} - ${itemID}: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      failedItems++;
      updateProgress((deletedItems + failedItems) / totalItems * 100);
    }
  }

  if (deletedItems === totalItems) {
    updateStatus('All items deleted successfully');
  } else {
    updateStatus(`Deleted ${deletedItems} out of ${totalItems} items. Some items could not be deleted.`);
  }
};