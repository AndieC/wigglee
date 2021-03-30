import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, makeStyles } from '@material-ui/core';
import { isCompositeComponent } from 'react-dom/test-utils';

const useStyles = makeStyles({
  body: {
    background: '#1ED882',
    overflow: 'hidden',
    color: 'white',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    height: '150%',
    width: '100%',
    padding: 10,
    margin: 0,
  },
  items: {
    margin: 3,
  },
  button: {
    color: 'black',
  },
});

export default function CongratsDialog(props) {
  console.log('DIALOG PROPS -->', props);
  const classes = useStyles();
  return (
    <div className={classes.body}>
      <Typography variant="h4" className={classes.items}>
        {' '}
        Way to go!
      </Typography>
      <Typography varaint="subtitle1" className={classes.items}>
        What would you like to do next?
      </Typography>
      <Button
        variant="contained"
        color="inherit"
        component={Link}
        to="/exercises"
        className={classes.button}
      >
        Keep Moving
      </Button>
      {/* <Button
        variant="contained"
        color="light"
        componet={Link}
        to="/childdashboard/:id"
        className={classes.items}
      >
        Check out my points
      </Button> */}
    </div>
  );
}
