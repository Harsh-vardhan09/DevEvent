"use client";
import { createBooking } from "@/lib/actions/booking.actions";
import { useState } from "react";

const BookEvent = ({eventId,slug}:{eventId:string,slug:string}) => {
  const [email, setEmail] = useState("");
  const [submitted, setsubmitted] = useState(false);

  const hanldeSubmit=async(e:React.FormEvent)=>{
    const {success}=await createBooking({eventId,email});
    
    if(success){
      setsubmitted(true)
      console.log("booking successful");
      
    }else{
      console.error("booking failed");
      
    }
    e.preventDefault();

  }

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm"> Thankyou for signing up</p>
      ) : (
        <form action="" onSubmit={hanldeSubmit}>
          <div>
            <label htmlFor="email"> Email adress</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="enter your email adress"
            />
          </div>
          <button type="submit" className="button-submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
