import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CertificateService from "../../../services/api/CertificateService";
import { pageVariants } from "../../../utils/helpers";

const AllCertificatesPage = () => {
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await CertificateService.getAllCertificates(params);
      if (res.success) {
        setCertificates(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to load certificates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [filter]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${styles[status] || ""}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-6 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-heading mb-2">
            All <span className="gradient-text">Certificates</span>
          </h1>
          <p className="text-muted">
            View and manage all student certificates
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                filter === status
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white border border-gray-200 border-dashed rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 text-primary">
              <Icon name="award" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-heading">
              No Certificates Found
            </h2>
            <p className="text-muted">
              No certificates match the selected filter.
            </p>
          </div>
        ) : (
          /* Certificates Table */
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Approved By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {certificates.map((item) => {
                    const student = item.userId;
                    const course = item.courseId;
                    const completedDate = new Date(item.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const approvedDate = item.certificateApprovedAt 
                      ? new Date(item.certificateApprovedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : "-";

                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {student?.avatarURL ? (
                              <img
                                src={student.avatarURL}
                                alt={student.fullname}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {(student?.fullname || student?.username || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-heading">
                                {student?.fullname || student?.username}
                              </div>
                              <div className="text-sm text-muted">{student?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-heading max-w-xs">
                            {course?.title || "Unknown Course"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted">
                          {course?.instructorId?.fullname || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-muted">
                          {completedDate}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.certificateStatus)}
                        </td>
                        <td className="px-6 py-4 text-muted">
                          {item.certificateApprovedBy?.fullname || "-"}
                          {item.certificateApprovedBy && (
                            <div className="text-xs text-gray-400">{approvedDate}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AllCertificatesPage;
