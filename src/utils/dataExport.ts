import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const jsonMetadata = {
    export_metadata: {
        app: 'Boxes',
        export_version: '1-0-2',
        export_date: new Date().toISOString(),    
    }
};

async function getData() {
    try {
        const result = await client.models.Boxes.list();
        const filteredData = result.data.map(item => {
            const { updatedAt, ...rest } = item;
            return rest;
        });
        return filteredData;
    } catch (error) {
        console.error(error);
    }
}

export default async function exportJSON() {
    try {
        const data = await getData();
        const exportData = {
            ...jsonMetadata,
            data: data
        };
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        link.click();
    } catch (error) {
        console.error('Error exporting JSON:', error);
    }
}