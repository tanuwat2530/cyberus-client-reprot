import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// --- Helper Functions and Constants ---

const formatTimestamp = (nsTimestamp) => {
    // This function remains the same as it is correct.
    try {
        if (!nsTimestamp) return 'N/A';
        const msTimestamp = BigInt(nsTimestamp) / BigInt(1000000);
        const date = new Date(Number(msTimestamp));
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true,
        });
    } catch (error) {
        console.error("Error formatting timestamp:", error);
        return 'Invalid Date';
    }
};

const ITEMS_PER_PAGE = 20;

export default function ClientHistoryTmvh() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();

    // State to hold the report data, initialized as an empty array.
    const [historyData, setHistoryData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // This effect runs once when the component mounts to fetch initial data.
        const username = localStorage.getItem('user');
        const session = localStorage.getItem('session');
        const partner_id = localStorage.getItem('partner_id');

        if (!username || !session || !partner_id) {
            router.push('/login');
            return;
        }
        
        // --- API Calls ---
        const checkSession = fetch(`${apiUrl}/report-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, session }),
        }).then(res => res.json());

        const getHistory = fetch(`${apiUrl}/report-request-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partnerId: partner_id, pathern: "DTAC-MO" }),
        }).then(res => res.json());

        Promise.all([checkSession, getHistory])
            .then(([sessionData, historyResponse]) => {
                if (sessionData.code === '0') {
                    router.push('/login');
                    return;
                }

                // FIX: Check if the history data is an array before setting it.
                // The API might return an object like { results: [...] }. Adjust if needed.
                if (Array.isArray(historyResponse)) {
                    setHistoryData(historyResponse);
                } else if (historyResponse && Array.isArray(historyResponse.results)) {
                    setHistoryData(historyResponse.results);
                } else {
                    console.error("API response for history is not an array:", historyResponse);
                    setHistoryData([]); // Set to empty array to prevent map error
                }
            })
            .catch(err => {
                console.error("Failed to fetch data:", err);
                setError("Could not load report data.");
            })
            .finally(() => {
                setLoading(false);
            });

    // FIX: The dependency array should be empty to run only once on mount.
    // Adding `historyData` caused an infinite loop.
    }, [apiUrl, router]);

    // useMemo helps to avoid re-parsing the JSON on every re-render unless the data changes.
    const processedData = useMemo(() => {
        if (!Array.isArray(historyData)) {
            // This check prevents the .map error if historyData is not an array
            return [];
        }
        return historyData.map(item => {
            try {
                const parsedValue = JSON.parse(item.value);
                return {
                    key: item.key,
                    ...parsedValue,
                    formattedTimestamp: formatTimestamp(parsedValue.timestamp),
                };
            } catch (error) {
                console.error("Failed to parse JSON value for key:", item.key, error);
                return { key: item.key, error: 'Invalid JSON data' };
            }
        });
    }, [historyData]);

    // Pagination logic remains the same
    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return processedData.slice(startIndex, endIndex);
    }, [processedData, currentPage]);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    // --- Render Logic ---

    if (loading) {
        return <div className="text-center py-10">Loading Report...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#FFFFFF' }}>
            <div className="max-w-7xl mx-auto">
                <center>
                    <b>
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">DTAC HISTORY (LAST 10 DAYS)</h1>
                </b>
                </center>
                <br/>
                <br/>
                <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-300 bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Partner ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ADS ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Client IP</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ref ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.length > 0 ? paginatedData.map((row, index) => (
                                <tr key={row.key || index} className="hover:bg-gray-50 transition-colors duration-200">
                                    {row.error ? (
                                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            <span className="font-bold">{row.key}</span> - {row.error}
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.transaction_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.partner_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.adsid}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.client_ip}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.refid}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.formattedTimestamp}</td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">No history data found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center mt-6 space-x-4">
                    <center>
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        PREV.
                    </button>
                    <span className="text-sm text-gray-600">
                         {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        NEXT.
                    </button>
                    </center>
                </div>
                  <center>
                        <br/>
                        <nav><a href="/client-report/report" title="REPORT">SUMMARY REPORT</a></nav>
                    </center>
            </div>
        </div>
    );
}
