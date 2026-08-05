"use client";
import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setsubmitted] = useState(false);

  const hanldeSubmit=(e:React.FormEvent)=>{
    e.preventDefault();

    setTimeout(()=>{
      setsubmitted(true);
    },1000)
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
