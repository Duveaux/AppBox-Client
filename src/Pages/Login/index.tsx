import React, { useState, useGlobal } from "reactn";
import styles from "./styles.module.scss";
import { motion } from "framer-motion";
import {
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  TextField,
  Button
} from "@material-ui/core";
import { useEffect } from "react";
import uniqid from "uniqid";
import Server from "../../Utils/Server";

const LoginPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const list = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        ease: "easeOut"
      }
    },
    hidden: {
      opacity: 0,
      x: "-40vw",
      transition: {
        when: "afterChildren"
      }
    }
  };
  const item = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 10 }
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={list}
        className={`${styles.left} bg`}
      >
        <div className="center">
          <motion.div variants={item}>
            <Tabs
              value={currentTab}
              onChange={(_, v) => {
                setCurrentTab(v);
              }}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Log in" />
              <Tab label="Register" />
            </Tabs>
          </motion.div>
          <motion.div variants={item}>
            {currentTab === 0 ? <Login /> : <Register />}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

const Register: React.FC = () => {
  const [userType, setUserType] = useState();
  // Lifecycle
  useEffect(() => {
    // Object type information
    const requestId = uniqid();
    Server.emit("listenForObjectTypes", {
      requestId,
      filter: { key: "user" }
    });
    Server.on(`receive-${requestId}`, data => {
      console.log("Received userType", data[0]);
      setUserType(data[0]);
    });

    return () => {
      Server.emit("unlistenForObjects", { requestId });
    };
  }, []);

  // UI
  if (userType === undefined) return <CircularProgress />;
  return <>Todo</>;
};

const Login: React.FC = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [_, setGlobalUser] = useGlobal<any>("user");

  // UI
  return (
    <Grid container>
      <Grid item xs={12}>
        <TextField
          fullWidth
          margin="normal"
          variant="outlined"
          label="Username"
          value={user.username}
          onChange={e => {
            setUser({ ...user, username: e.target.value });
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          margin="normal"
          variant="outlined"
          label="Password"
          type="password"
          value={user.password}
          onChange={e => {
            setUser({ ...user, password: e.target.value });
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          fullWidth
          onClick={() => {
            const requestId = uniqid();
            Server.emit("requestToken", { requestId, user });
            Server.on(`receive-${requestId}`, response => {
              if (response.success) {
                localStorage.setItem("username", user.username);
                localStorage.setItem("token", response.token);
                const signInRequest = uniqid();
                Server.emit("signIn", {
                  requestId: signInRequest,
                  username: user.username,
                  token: response.token
                });
                Server.on(`receive-${signInRequest}`, response => {
                  if (response.success) {
                    setGlobalUser(response.user);
                  } else {
                    console.log(response.reason);
                  }
                });
              } else {
                console.log(response.reason);
              }
            });
          }}
        >
          Sign in
        </Button>
      </Grid>
    </Grid>
  );
};
export default LoginPage;
