import { useEffect } from "react";
import { useState } from "react"
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import RegistrationForm from "../Components/RegistrationForm ";
import Modal from "../Components/Modal";
import LoadingSpinner from "../Components/LoadingSpiner";

export default function orders(){
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
  
    useEffect(()=> {
        getUsers();
    }, [])

    const onDeleteClick = user => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
          return
        }
        axiosClient.delete(`/orders/${user.id}`)
          .then(() => {
            getUsers()
          })
      }

    const getUsers = () => {
        setLoading(true)
        axiosClient.get('/getOrders')
          .then(({ data }) => {
            setLoading(false)
            setOrders(data.data)
          })
          .catch(() => {
            setLoading(false)
          })
      }

    return(
        <div>
       
        <button   >
        <Link className="btn-add" to="/">Add Job Order</Link>

      </button>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
        <RegistrationForm />
      </Modal>
      {loading && <LoadingSpinner/>}  

        <div className="card animated fadeInDown">     
        {/* <pre>{JSON.stringify(orders, null, 2)};
        </pre> */}

        <div className="container mx-auto py-8">
  <h2 className="text-xl font-semibold mb-4">Jobs Overview</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto bg-white shadow-md rounded">
      <thead>
        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <th className="py-3 px-6 text-left">Job Assessment No</th>
          <th className="py-3 px-6 text-left">Reference</th>
          <th className="py-3 px-6 text-left">Approved</th>
          <th className="py-3 px-6 text-left">Job Title</th>
          <th className="py-3 px-6 text-left">Job Description</th>
          <th className="py-3 px-6 text-left">Company</th>
          <th className="py-3 px-6 text-left">Job Id</th>
          <th className="py-3 px-6 text-left">Job Ref</th>

          <th className="py-3 px-6 text-left">Actions</th>

        </tr>
      </thead>
       {!loading &&
             <tbody className="text-gray-600 text-sm font-light">
             {orders.map((order) => (
               <tr key={order.reference} className="border-b border-gray-200 hover:bg-gray-100">
                 <td className="py-3 px-6 text-left whitespace-nowrap">{order.jobAssessmentNo}</td>
                 <td className="py-3 px-6 text-left">{order.reference}</td>
                 <td className="py-3 px-6 text-left">
  <span
    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
      order.approved === "1"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {order.approved === "1" ? (
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    )}
    {order.approved === "1" ? "Approved" : "Not Approved"}
  </span>
</td>
{/* <pre>{JSON.stringify(order, null, 2)};
    </pre> */}
                 <td className="py-3 px-6 text-left">{order.title || "N/A"}</td>
                 <td className="py-3 px-6 text-left">{order.description || "N/A"}</td>
                 <td className="py-3 px-6 text-left">{order.company || "N/A"}</td>
                 <td className="py-3 px-6 text-left">{order.id || "N/A"}</td>
                 <td className="py-3 px-6 text-left">{order.Reference || "N/A"}</td>

        
           
                  <td>
                    <Link className="btn-edit" to={'/orders/' + order.id}>View</Link>
                    &nbsp;
                    <button className="btn-delete" onClick={ev => onDeleteClick(order)}>Delete</button>
                  </td>
                </tr>
              ))}
              </tbody>
            }
        
    </table>
  </div>
</div>
          
        </div>
      </div>
    )
}