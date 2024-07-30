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

const handleVersion102 = async (
  data: any[],
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, success: boolean, message: string) => void
) => {
  for (const item of data) {
    const { boxID, boxName, itemID, itemName } = item;
    try {
      const result = await client.models.Boxes.create(item);
      if (result) {
        updateStatus(boxID, boxName, itemID, itemName, true, 'Imported successfully');
      } else {
        updateStatus(boxID, boxName, itemID, itemName, false, 'Failed to add item to the table');
      }
    } catch (error) {
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
  updateStatus: (boxID: string, boxName: string, itemID: string, itemName: string, success: boolean, message: string) => void
) => {
  const { export_metadata, data } = jsonData;

  switch (export_metadata.export_version) {
    case '1-0-2':
      await handleVersion102(data, updateStatus);
      break;
    default:
      throw new Error(`Unsupported export version: ${export_metadata.export_version}`);
  }
};
