import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ShowtimeForm from '../../components/admin/ShowtimeForm';
import FormWrapper from '../../components/common/FormWrapper';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import showtimeService from '../../services/showtimeService';
import { movieService } from '../../services/MovieService';
import studioService from '../../services/studioService';

const ShowtimeManager = () => {    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showtimeToDelete, setShowtimeToDelete] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);    const fetchData = async () => {
        setLoading(true);
        try {
            const [showtimesRes, moviesRes, studiosRes] = await Promise.all([
                showtimeService.getAll(),
                movieService.getAll(),
                studioService.getAll()
            ]);
            
            setShowtimes(showtimesRes.data || []);
            setMovies(moviesRes.data || []);
            setStudios(studiosRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback to mock data if API fails
            const mockMovies = [
                { movie_id: 1, title: 'Avengers: Endgame' },
                { movie_id: 2, title: 'Spider-Man: No Way Home' }
            ];
            
            const mockStudios = [
                { studio_id: 1, studio_name: 'Studio A' },
                { studio_id: 2, studio_name: 'Studio B' }
            ];
            
            const mockShowtimes = [
                {
                    showtime_id: 1,
                    movie_id: 1,
                    studio_id: 1,
                    show_date: '2024-06-15',
                    show_time: '19:30:00',
                    ticket_price: 50000,
                    Movie: { title: 'Avengers: Endgame' },
                    Studio: { studio_name: 'Studio A' },
                    created_at: '2024-01-01T00:00:00Z'
                },
                {
                    showtime_id: 2,
                    movie_id: 2,
                    studio_id: 2,
                    show_date: '2024-06-15',
                    show_time: '21:00:00',
                    ticket_price: 55000,
                    Movie: { title: 'Spider-Man: No Way Home' },
                    Studio: { studio_name: 'Studio B' },
                    created_at: '2024-01-01T00:00:00Z'
                }
            ];
            
            setMovies(mockMovies);
            setStudios(mockStudios);
            setShowtimes(mockShowtimes);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingShowtime(null);
        setShowForm(true);
    };

    const handleEdit = (showtime) => {
        setEditingShowtime(showtime);
        setShowForm(true);
    };

    const handleDelete = (showtime) => {
        setShowtimeToDelete(showtime);
        setShowDeleteDialog(true);
    };    const handleFormSubmit = async (formData) => {
        try {
            if (editingShowtime) {
                await showtimeService.update(editingShowtime.showtime_id, formData);
                console.log('Showtime updated successfully');
                setShowtimes(showtimes.map(showtime => 
                    showtime.showtime_id === editingShowtime.showtime_id 
                        ? { 
                            ...showtime, 
                            ...formData,
                            Movie: movies.find(m => m.movie_id === formData.movie_id),
                            Studio: studios.find(s => s.studio_id === formData.studio_id)
                        }
                        : showtime
                ));
            } else {
                const response = await showtimeService.create(formData);
                console.log('Showtime created successfully');
                const newShowtime = {
                    ...formData,
                    showtime_id: response.data?.showtime_id || Date.now(),
                    Movie: movies.find(m => m.movie_id === formData.movie_id),
                    Studio: studios.find(s => s.studio_id === formData.studio_id),
                    created_at: new Date().toISOString()
                };
                setShowtimes([...showtimes, newShowtime]);
            }
            setShowForm(false);
            setEditingShowtime(null);
        } catch (error) {
            console.error('Error saving showtime:', error);
            alert('Error saving showtime. Please try again.');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await showtimeService.delete(showtimeToDelete.showtime_id);
            console.log('Showtime deleted successfully');
            setShowtimes(showtimes.filter(showtime => showtime.showtime_id !== showtimeToDelete.showtime_id));
            setShowDeleteDialog(false);
            setShowtimeToDelete(null);
        } catch (error) {
            console.error('Error deleting showtime:', error);
            alert('Error deleting showtime. Please try again.');
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingShowtime(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setShowtimeToDelete(null);
    };    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Showtime Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage movie showtimes and scheduling.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Showtime
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="mt-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Movie
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Studio
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {showtimes.map((showtime) => (
                                            <tr key={showtime.showtime_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {showtime.Movie?.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {showtime.Studio?.studio_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(showtime.show_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {showtime.show_time}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    IDR {parseInt(showtime.ticket_price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(showtime)}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                            title="Edit Showtime"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(showtime)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded"
                                                            title="Delete Showtime"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {showtimes.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-gray-500">No showtimes found. Add your first showtime to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Showtime Form Modal */}
            {showForm && (
                <FormWrapper
                    title={editingShowtime ? 'Edit Showtime' : 'Add New Showtime'}
                    onClose={handleCancelForm}
                >
                    <ShowtimeForm
                        initialData={editingShowtime}
                        movies={movies}
                        studios={studios}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancelForm}
                    />
                </FormWrapper>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <ConfirmDialog
                    title="Delete Showtime"
                    message={`Are you sure you want to delete this showtime? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    type="danger"
                />
            )}
        </div>
    );
};

export default ShowtimeManager;
