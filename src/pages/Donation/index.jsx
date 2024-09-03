import "./home.css";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
import getdate from "../../utils/getDate.js";

const Donation = () => {
  const text = "Companion";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const [today, setToday] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const VITE_URL_API = import.meta.env.VITE_URL_API;

  // const fetchExpenditures = async () => {
  //   let token = localStorage.getItem('token');
  //   if (!token) {
  //       navigate("/admin");
  //       return;
  //   }

  //   try {
  //     const response = await axios.get('http://localhost:3000/expenditures', {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //     });

  //     if (response.status === 200) {
  //       setExpenses(response.data.expenses);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching expenditures:", error);
  //     if (error.response && error.response.data) {
  //       toast.error(JSON.stringify(error.response.data));
  //     } else {
  //       toast.error('An unknown error occurred');
  //     }
  //   }
  // };

  useEffect(() => {
    // fetchExpenditures();

    let token = localStorage.getItem('token');
    if (!token) {
        navigate("/admin");
        return;
    }

    let timeout;
    if (index < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, 300);
    } else {
      timeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [index, text, navigate]);

  useEffect(() => {
    setToday(getdate());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');
    if (!token) {
        navigate("/admin");
        return;
    }

    let data = { description, amount };

    try {
      const response = await axios.post(`${VITE_URL_API}/ddonation`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast.success("Running ...");
        fetchExpenditures(); // Fetch the expenditures again after a successful submission
      }
    } catch (error) {
        toast.error('An unknown error occurred');
    }
  };

  return (
    <div className="home-content">
      <div className="today">
        <p className="today-text">{today}</p>
      </div>
      <div style={{margin:"25px"}}>
        <div style={{borderColor:'orange', borderWidth:'2px', borderStyle: 'solid', width:'50%', borderRadius:'8px', padding:'10px'}}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="description"><b>Description :</b></label>
            <input
              id="description"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              aria-label="Enter a description"
              type="text"
              name="description"
              placeholder="Enter a description"
              onChange={(e) => {
                  setDescription(e.target.value);
              }}
              required
              style={{marginRight: '10px' }}
            />
            <br />
            <label htmlFor="amount"><b>Amount :</b></label>
            <input
              id="amount"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              aria-label="Enter an amount"
              type="number"
              name="amount"
              placeholder="Enter an amount"
              onChange={(e) => {
                  setAmount(e.target.value);
              }}
              required
              style={{marginRight: '10px' }}
            /><br></br>
            <div style={{borderColor:'orange', borderWidth:'2px', borderRadius:'3px',textAlign:'center',color:'white',backgroundColor:'orange'}}>
              <input
                type="submit"
                aria-label="Se connecter"
                value="DONNER"
              />
            </div>
          </form>
        </div>
        <br />
        <div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Description</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                </tr>
              </thead>
              {/* <tbody>
                {expenses.map((expense, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">{expense.description}</td>
                    <td className="px-6 py-4">{new Date(expense.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{expense.amount}</td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;
