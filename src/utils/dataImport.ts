import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface ExportMetadata {
  app: string;
  export_version: string;
  export_date: string;
}

interface ExportData {
  export_metadata: ExportMetadata;
  data: any[];
}

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

const handleVersion102 = async (
  data: any[],
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, success: boolean, message: string, isWarning?: boolean) => void
) => {
  const existingItems = await existingData();
  console.log('Data to import:', data);

  if (data.length === 0) {
    updateStatus('', '', '', '', false, 'No items to import.');
    return;
  }

  for (const item of data) {
    let parsedItem;
    try {
      parsedItem = JSON.parse(JSON.stringify(item)); // Checking if item is a proper JSON format
    } catch (error) {
      console.error('Corrupted item:', item);
      updateStatus('', '', '', '', false, 'Corrupted item: Not a valid JSON format.');
      continue;
    }

    const { boxID, boxName, itemID, itemName, location, quantity, note } = parsedItem;

    // Check for required fields
    if (!boxID || !itemID) {
      console.error('Missing required fields:', parsedItem);
      updateStatus(boxID || '', boxName || '', itemID || '', itemName || '', false, 'Missing required fields: boxID or itemID.');
      continue;
    }

    // Check for duplicates
    const isDuplicate = existingItems.some(existingItem => existingItem.boxID === boxID && existingItem.itemID === itemID);
    if (isDuplicate) {
      updateStatus(boxID, boxName, itemID, itemName, false, 'Duplicate detected', true);
      continue;
    }

    // Attempt to create item
    try {
      console.log('Attempting to create item:', parsedItem);
      const result = await client.models.Boxes.create({
        boxID,
        itemID,
        boxName,
        itemName,
        location,
        quantity,
        note
      });
      console.log('Create result:', result);

      if (result) {
        updateStatus(boxID, boxName, itemID, itemName, true, '✓');
      } else {
        console.error('Failed to add item to the table:', parsedItem);
        updateStatus(boxID, boxName, itemID, itemName, false, 'Failed to add item to the table');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      if (error instanceof Error) {
        updateStatus(boxID, boxName, itemID, itemName, false, error.message);
      } else {
        updateStatus(boxID, boxName, itemID, itemName, false, 'An unknown error occurred');
      }
    }
  }
};

export const importData = async (
  jsonData: ExportData,
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, success: boolean, message: string, isWarning?: boolean) => void
) => {
  const { export_metadata, data } = jsonData;
  console.log('Importing data with metadata:', export_metadata);

  try {
    switch (export_metadata.export_version) {
      case '1-0-2':
        await handleVersion102(data, updateStatus);
        break;
      default:
        throw new Error(`Unsupported export version: ${export_metadata.export_version}`);
    }
  } catch (error) {
    console.error('Error in importData function:', error);
    updateStatus('', '', '', '', false, `Failed to import data: ${error.message}`);
  }
};
