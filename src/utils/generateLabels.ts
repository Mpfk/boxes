import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { saveAs } from 'file-saver';

const client = generateClient<Schema>();

interface BoxItem {
  boxID: string;
  itemID: string;
  boxName: string | null;
  // Add other fields as necessary
}

interface ListResponse {
  data: BoxItem[];
  nextToken: string | null;
}

const fetchBoxRootItems = async (): Promise<BoxItem[]> => {
  let allItems: BoxItem[] = [];
  let nextToken: string | null = null;

  try {
    do {
      const response = await client.models.Boxes.list({ nextToken });
      if (!response || !response.data) {
        throw new Error('Failed to fetch data from the server.');
      }

      const listResponse: ListResponse = {
        data: response.data || [],
        nextToken: response.nextToken ?? null,
      };

      allItems = allItems.concat(listResponse.data);
      nextToken = listResponse.nextToken;
    } while (nextToken);

    // Filter items where itemID is box_root
    return allItems.filter(item => item.itemID === 'box_root');
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

export const generateLabels = async (): Promise<void> => {
  try {
    const items = await fetchBoxRootItems();

    if (items.length === 0) {
      console.error('No items found with itemID "box_root".');
      return;
    }

    const domain = window.location.origin; // Dynamically get the current domain

    // Generate CSV content
    const csvContent = items.reduce((csv, item) => {
      const url = `${domain}/box/${item.boxID}`;
      return csv + `${url},${item.boxName ?? ''}\n`;
    }, 'boxID,boxName\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Use FileSaver to save the CSV file
    saveAs(blob, 'labels.csv');
  } catch (error) {
    console.error('Error generating labels:', error);
  }
};