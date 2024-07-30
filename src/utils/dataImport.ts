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

const generateId = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const handleVersion102 = async (
  data: any[],
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void
): Promise<any[]> => {
  const existingItems = await existingData();
  console.log('Data to import:', data);

  const duplicates = [];

  if (data.length === 0) {
    updateStatus('', '', '', '', 'failure', 'No items to import.');
    return duplicates;
  }

  for (const item of data) {
    let parsedItem;
    try {
      parsedItem = JSON.parse(JSON.stringify(item)); // Checking if item is a proper JSON format
    } catch (error) {
      console.error('Corrupted item:', item);
      updateStatus('', '', '', '', 'failure', 'Corrupted item: Not a valid JSON format.');
      continue;
    }

    const { boxID, boxName, itemID, itemName, location, quantity, note } = parsedItem;

    // Check for required fields
    if (!boxID || !itemID) {
      console.error('Missing required fields:', parsedItem);
      updateStatus(boxID || '', boxName || '', itemID || '', itemName || '', 'failure', 'Missing required fields: boxID or itemID.');
      continue;
    }

    // Check for duplicates
    const isDuplicate = existingItems.some(existingItem => existingItem.boxID === boxID && existingItem.itemID === itemID);
    if (isDuplicate) {
      duplicates.push(parsedItem);
      updateStatus(boxID, boxName, itemID, itemName, 'warning', 'Duplicate detected');
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

      if (result && result.data) {
        updateStatus(boxID, boxName, itemID, itemName, 'success', '✓');
      } else {
        console.error('Failed to add item to the table:', parsedItem);
        updateStatus(boxID, boxName, itemID, itemName, 'failure', 'Failed to add item to the table');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      if (error instanceof Error) {
        updateStatus(boxID, boxName, itemID, itemName, 'failure', error.message);
      } else {
        updateStatus(boxID, boxName, itemID, itemName, 'failure', 'An unknown error occurred');
      }
    }
  }

  console.log('Duplicates:', duplicates);
  return duplicates;
};

export const importData = async (
  jsonData: ExportData,
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void
): Promise<any[]> => {
  const { export_metadata, data } = jsonData;
  console.log('Importing data with metadata:', export_metadata);

  try {
    switch (export_metadata.export_version) {
      case '1-0-2':
        return await handleVersion102(data, updateStatus);
      default:
        throw new Error(`Unsupported export version: ${export_metadata.export_version}`);
    }
  } catch (error) {
    console.error('Error in importData function:', error);
    updateStatus('', '', '', '', 'failure', `Failed to import data: ${error.message}`);
    return [];
  }
};

export const handleDuplicates = async (
  duplicates: any[],
  action: 'ignore' | 'overwrite' | 'add',
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void
) => {
  if (action === 'ignore') {
    duplicates.forEach(duplicate => {
      const { boxID, boxName, itemID, itemName } = duplicate;
      updateStatus(boxID, boxName, itemID, itemName, 'ignored', 'Duplicate ignored');
    });
  } else if (action === 'overwrite') {
    for (const duplicate of duplicates) {
      const { boxID, itemID, boxName, itemName, location, quantity, note } = duplicate;
      try {
        console.log('Attempting to update item:', { boxID, itemID, boxName, itemName, location, quantity, note });

        // Fetch the existing item data before update
        const existingItem = await client.models.Boxes.get({ boxID, itemID });
        console.log('Existing item before update:', existingItem);

        const result = await client.models.Boxes.update({ boxID, itemID, boxName, itemName, location, quantity, note });
        console.log('Update result:', result);

        // Fetch the updated item data after update
        const updatedItem = await client.models.Boxes.get({ boxID, itemID });
        console.log('Updated item after update:', updatedItem);

        if (result && result.data) {
          updateStatus(boxID, boxName, itemID, itemName, 'success', '✓');
        } else {
          console.error('Failed to update item in the table:', { boxID, itemID, boxName, itemName, location, quantity, note });
          updateStatus(boxID, boxName, itemID, itemName, 'failure', 'Failed to update item in the table');
        }
      } catch (error) {
        console.error('Error updating item:', error);
        if (error instanceof Error) {
          updateStatus(boxID, boxName, itemID, itemName, 'failure', error.message);
        } else {
          updateStatus(boxID, boxName, itemID, itemName, 'failure', 'An unknown error occurred');
        }
      }
    }
  } else if (action === 'add') {
    const newBoxIDs = new Map<string, string>();

    for (const duplicate of duplicates) {
      const { boxID, itemID, boxName, itemName, location, quantity, note } = duplicate;
      let newBoxID = newBoxIDs.get(boxID);
      if (!newBoxID) {
        newBoxID = generateId(6);
        newBoxIDs.set(boxID, newBoxID);
      }

      const newItemID = itemID === 'box_root' ? 'box_root' : generateId(20);

      try {
        console.log('Attempting to add duplicate item with new IDs:', { newBoxID, newItemID, boxName, itemName, location, quantity, note });
        const result = await client.models.Boxes.create({ boxID: newBoxID, itemID: newItemID, boxName, itemName, location, quantity, note });
        console.log('Add duplicate result:', result);

        if (result && result.data) {
          updateStatus(newBoxID, boxName, newItemID, itemName, 'success', '✓');
        } else {
          console.error('Failed to add duplicate item to the table:', { newBoxID, newItemID, boxName, itemName, location, quantity, note });
          updateStatus(newBoxID, boxName, newItemID, itemName, 'failure', 'Failed to add duplicate item to the table');
        }
      } catch (error) {
        console.error('Error creating duplicate item:', error);
        if (error instanceof Error) {
          updateStatus(newBoxID, boxName, newItemID, itemName, 'failure', error.message);
        } else {
          updateStatus(newBoxID, boxName, newItemID, itemName, 'failure', 'An unknown error occurred');
        }
      }
    }
  }
};
