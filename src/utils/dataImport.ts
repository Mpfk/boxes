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
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void,
  updateProgress: (progress: number) => void
): Promise<{ duplicates: any[], orphans: any[] }> => {
  const existingItems = await existingData();
  console.log('Data to import:', data);

  const knownBoxIDs = new Set<string>();
  const duplicates = [];
  const orphans = [];
  const totalItems = data.length;
  let processedItems = 0;

  // Populate knownBoxIDs from existing items
  existingItems.forEach(item => {
    if (item.itemID === 'box_root') {
      knownBoxIDs.add(item.boxID);
    }
  });

  // Populate knownBoxIDs from incoming data
  data.forEach(item => {
    if (item.itemID === 'box_root') {
      knownBoxIDs.add(item.boxID);
    }
  });

  if (totalItems === 0) {
    updateStatus('', '', '', '', 'failure', 'No items to import.');
    return { duplicates, orphans };
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
    if (!itemID) {
      console.error('Missing required field itemID:', parsedItem);
      updateStatus(boxID || '', boxName || '', itemID || '', itemName || '', 'failure', 'Missing required field: itemID.');
      continue;
    }

    // Check if item is an orphan (missing boxID or unknown boxID)
    if (!boxID || !knownBoxIDs.has(boxID)) {
      orphans.push(parsedItem);
      updateStatus(boxID || '', boxName || '', itemID, itemName || '', 'warning', 'Orphaned item detected (missing or unknown boxID)');
      processedItems++;
      updateProgress((processedItems / totalItems) * 100);
      continue;
    }

    // Check for duplicates
    const isDuplicate = existingItems.some(existingItem => existingItem.boxID === boxID && existingItem.itemID === itemID);
    if (isDuplicate) {
      duplicates.push(parsedItem);
      updateStatus(boxID, boxName, itemID, itemName, 'warning', 'Duplicate detected');
      processedItems++;
      updateProgress((processedItems / totalItems) * 100);
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
    processedItems++;
    updateProgress((processedItems / totalItems) * 100);
  }

  console.log('Duplicates:', duplicates);
  console.log('Orphans:', orphans);
  return { duplicates, orphans };
};

export const importData = async (
  jsonData: ExportData,
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void,
  updateProgress: (progress: number) => void
): Promise<{ duplicates: any[], orphans: any[] }> => {
  const { export_metadata, data } = jsonData;
  console.log('Importing data with metadata:', export_metadata);

  try {
    switch (export_metadata.export_version) {
      case '1-0-2':
        return await handleVersion102(data, updateStatus, updateProgress);
      default:
        throw new Error(`Unsupported export version: ${export_metadata.export_version}`);
    }
  } catch (error) {
    console.error('Error in importData function:', error);
    updateStatus('', '', '', '', 'failure', `Failed to import data: ${error.message}`);
    return { duplicates: [], orphans: [] };
  }
};

export const handleDuplicates = async (
  duplicates: any[],
  action: 'ignore' | 'overwrite' | 'add',
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void,
  updateProgress: (progress: number) => void
) => {
  const totalItems = duplicates.length;
  let processedItems = 0;

  if (action === 'ignore') {
    duplicates.forEach(duplicate => {
      const { boxID, boxName, itemID, itemName } = duplicate;
      updateStatus(boxID, boxName, itemID, itemName, 'ignored', 'Duplicate ignored');
      processedItems++;
      updateProgress((processedItems / totalItems) * 100);
    });
  } else if (action === 'overwrite') {
    for (const duplicate of duplicates) {
      const { boxID, itemID, boxName, itemName, location, quantity, note } = duplicate;
      try {
        console.log('Attempting to update item:', { boxID, itemID, boxName, itemName, location, quantity, note });
        const result = await client.models.Boxes.update({ boxID, itemID, boxName, itemName, location, quantity, note });
        console.log('Update result:', result);

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
      processedItems++;
      updateProgress((processedItems / totalItems) * 100);
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
      processedItems++;
      updateProgress((processedItems / totalItems) * 100);
    }
  }
};

export const handleOrphans = async (
  orphans: any[],
  action: 'ignore' | 'import',
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, importStatus: string, message: string) => void,
  updateProgress: (progress: number) => void
) => {
  const totalItems = orphans.length;
  let processedItems = 0;

  if (action === 'ignore') {
    orphans.forEach(orphan => {
      const { boxID, boxName, itemID, itemName } = orphan;
      updateStatus(boxID, boxName, itemID, itemName, 'ignored', 'Orphan ignored');
      processedItems++;
      updateProgress((processedItems / totalItems) * 100);
    });
  } else if (action === 'import') {
    const newBoxID = generateId(6);
    const boxName = 'Imported Items';
    const location = `Imported ${new Date().toLocaleDateString()}`;

    try {
      // Create a new box for orphaned items
      const newBoxResult = await client.models.Boxes.create({
        boxID: newBoxID,
        itemID: 'box_root',
        boxName,
        location
      });
      console.log('New box created for orphans:', newBoxResult);

      for (const orphan of orphans) {
        const { boxID: originalBoxID, itemID, itemName, location, quantity, note } = orphan;

        // Create a new item with the imported info and new boxID
        const newItemID = generateId(20);
        const result = await client.models.Boxes.create({
          boxID: newBoxID,
          itemID: newItemID,
          boxName: orphan.boxName,
          itemName,
          location,
          quantity,
          note
        });
        console.log('Add orphan result:', result);

        if (result && result.data) {
          updateStatus(originalBoxID, orphan.boxName, itemID, itemName, 'success', '✓');
        } else {
          console.error('Failed to add orphan item to the table:', orphan);
          updateStatus(originalBoxID, orphan.boxName, itemID, itemName, 'failure', 'Failed to add orphan item to the table');
        }
        processedItems++;
        updateProgress((processedItems / totalItems) * 100);
      }
    } catch (error) {
      console.error('Error creating new box for orphans or adding orphan items:', error);
      if (error instanceof Error) {
        orphans.forEach(orphan => {
          const { boxID: originalBoxID, itemID, itemName } = orphan;
          updateStatus(originalBoxID, orphan.boxName, itemID, itemName, 'failure', error.message);
        });
      } else {
        orphans.forEach(orphan => {
          const { boxID: originalBoxID, itemID, itemName } = orphan;
          updateStatus(originalBoxID, orphan.boxName, itemID, itemName, 'failure', 'An unknown error occurred');
        });
      }
    }
  }
};