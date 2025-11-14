// src/pages/dashboards/UserManagement.tsx
import { useEffect, useState } from "react";
import UserManagerment from "../services/UserManagerment";
import { Mail, ThumbsDown, ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import ThreeDotLoader from "../components/ThreeDotLoader";

interface PendingUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function UserManagement() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [active, setActive] = useState<PendingUser[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [tabs, setTabs] = useState<number>(1);

  const fetchPending = () => {
    UserManagerment.FetchpendingRequests()
      .then((r) => {
        setPending(r.requests);
        console.log("we got Pending ", r);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleDecision = async (id: number, action: "approve" | "reject") => {
    const payload = {
      user_id: id,
      action: action,
    };
    console.log("payload we Sending: ", payload);
    setSending(true);
    UserManagerment.ApproveRequest(payload)
      .then(() => {
        const text = action === "approve" ? "Approved" : "Rejected";
        console.log("text: ", text);
        toast.success(`Request ${text} Successfully`);
        console.log("toast appears");
        fetchPending();
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setSending(false);
      });
  };

  const fetchActive = async () => {
    UserManagerment.FetchactiveUsers()
      .then((r) => {
        console.log("Active Users List: ", r.requests);
        setActive(r.requests);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    fetchPending();
    fetchActive();
  }, []);

  useEffect(() => {
    console.log("tabs: ", tabs);
  }, [tabs]);

  return (
    <div className="p-6">
      {sending && (
        <span>
          Sending <ThreeDotLoader />
        </span>
      )}

      <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
      <p className="text-gray-600 mb-4 text-xs sm:text-sm">
        Manage pending user registrations
      </p>

      {/* Tabs */}
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={() => {
            setTabs(1);
          }}
          className={`${
            tabs === 1 ? "bg-blue-400 " : "border border-gray-500"
          } px-2 py-1 rounded font-semibold text-xs sm:text-sm whitespace-nowrap`}
        >
          Pending Users
        </button>
        <button
          onClick={() => {
            setTabs(2);
          }}
          className={`${
            tabs === 2 ? "bg-blue-400 " : "border border-gray-500"
          } px-2 py-1 rounded font-semibold text-xs sm:text-sm whitespace-nowrap`}
        >
          Active Users
        </button>
      </div>

      {/* Pending Registrations Requests */}
      {tabs === 1 && (
        <div>
          {pending.length === 0 ? (
            <p className="bg-white px-6 py-4 rounded-md text-center">
              No pending registrations 🎉
            </p>
          ) : (
            <div className="flex">
              {pending.map((u) => (
                <div
                  key={u.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row flex-1 justify-between items-start sm:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {u.first_name} {u.last_name} ({u.username})
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-sm text-gray-500">
                      Employee #: {u.employee_number}
                    </p>
                  </div>
                  <div className="flex mt-3 sm:mt-0 gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDecision(u.id, "approve")}
                      className="px-2 py-1 flex items-center min-w-[78px] text-[12px] gap-2 bg-green-500 text-white rounded-lg"
                    >
                      <ThumbsUp size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(u.id, "reject")}
                      className="px-2 py-1 flex items-center min-w-[78px] text-[12px] gap-2 bg-red-500 text-white rounded-lg"
                    >
                      <ThumbsDown size={12} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active User */}
      {tabs === 2 && (
        <div>
          {active.length === 0 ? (
            <p className="bg-white px-6 py-4 rounded-md text-center">
              No Active User
            </p>
          ) : (
            <div className="space-y-2">
              {active.map((u) => (
                <div
                  key={u.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center bg-white"
                >
                  <div>
                    <p className="font-medium">
                      {u.first_name} {u.last_name} ({u.username})
                    </p>
                    <p className="text-sm text-gray-500 flex gap-1 items-center">
                      <Mail size={14} />
                      {u.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Employee #: {u.employee_number}
                    </p>
                  </div>
                  <div className="flex self-end sm:self-center mt-4 sm:mt-0 gap-2">
                    <button
                      onClick={() => handleDecision(u.id, "reject")}
                      className="px-2 py-1 flex items-center min-w-[78px] text-[12px] gap-2 bg-red-500 text-white rounded-lg"
                    >
                      <ThumbsDown size={12} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
