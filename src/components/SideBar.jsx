import React from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from'@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { green, grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme)=>({
    sideBar: {
        [theme.breakpoints.down('sm')]: {
            display: "none"
        }
    }
}))

const SideBar = ({styleclass,users,userSelect}) => {
    const classes = useStyles();
    return (
        <Grid className={classes.sideBar} item md={4} lg={3}>
            <Paper className={styleclass} elevation={24} >
                <h2>Users</h2>
                <List >
                    {
                        users.map((user, index) => {
                            return (
                                <ListItem onClick={() => userSelect({rid: user.id, rname: user.name})} key={index} button divider>
                                    <ListItemIcon >
                                        <FiberManualRecordIcon style={{ color: (user.status)? green[400] : grey[400]}} />
                                    </ListItemIcon>
                                    <ListItemText primary={user.name} />
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Paper>
        </Grid>
    )
}

export default SideBar;
