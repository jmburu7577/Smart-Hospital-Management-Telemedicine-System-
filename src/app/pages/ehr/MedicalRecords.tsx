import { FileText, Download, Eye, Calendar, User, Loader2, Trash2 } from "lucide-react";
import { useMedicalRecords } from "../../contexts/MedicalRecordsContext";
import { useState } from "react";

export default function MedicalRecords() {
  const { records, loading, deleteRecord } = useMedicalRecords();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setDeleting(id);
      try {
        await deleteRecord(id);
      } catch (error) {
        alert("Failed to delete record");
      } finally {
        setDeleting(null);
      }
    }
  };

  const recordStats = {
    total: records.length,
    consultationNotes: records.filter(r => r.record_type === 'Consultation Note').length,
    reports: records.filter(r => r.record_type === 'Report').length,
    labResults: records.filter(r => r.record_type === 'Lab Result').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
        <p className="text-slate-600 mt-2">Access your complete health history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <FileText className="w-8 h-8 mb-3" />
          <p className="text-blue-100 text-sm mb-1">Total Records</p>
          <p className="text-3xl font-bold">{recordStats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
          <FileText className="w-8 h-8 mb-3" />
          <p className="text-green-100 text-sm mb-1">Lab Results</p>
          <p className="text-3xl font-bold">{recordStats.labResults}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <FileText className="w-8 h-8 mb-3" />
          <p className="text-purple-100 text-sm mb-1">Consultation Notes</p>
          <p className="text-3xl font-bold">{recordStats.consultationNotes}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <FileText className="w-8 h-8 mb-3" />
          <p className="text-orange-100 text-sm mb-1">Reports</p>
          <p className="text-3xl font-bold">{recordStats.reports}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Records</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-slate-600 mt-4">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No medical records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{record.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.record_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Dr. {record.doctor_id}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {record.record_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg" title="View">
                      <Eye className="w-5 h-5 text-slate-600" />
                    </button>
                    {record.file_url && (
                      <a href={record.file_url} download className="p-2 hover:bg-slate-200 rounded-lg" title="Download">
                        <Download className="w-5 h-5 text-slate-600" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(record.id)}
                      disabled={deleting === record.id}
                      className="p-2 hover:bg-red-100 rounded-lg disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === record.id ? (
                        <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
