const API_URL = '/api';

export const api = {
    // Load all data from JSON
    loadData: async () => {
        try {
            const response = await fetch(`${API_URL}/data`);
            if (!response.ok) throw new Error('Failed to load data');
            return await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    },

    // Save all data to JSON
    saveData: async (data: any) => {
        try {
            const response = await fetch(`${API_URL}/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to save data');
            return await response.json();
        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    },

    // Upload image file
    uploadImage: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload image');
            const result = await response.json();
            return result.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    // Delete image file
    deleteImage: async (imageUrl: string) => {
        try {
            const filename = imageUrl.split('/').pop();
            if (!filename) return;

            const response = await fetch(`${API_URL}/upload/${filename}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete image');
            return await response.json();
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    },
};
