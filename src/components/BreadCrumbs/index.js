import React from 'react';
import Widget from '../Widget';
import { Link } from 'react-router-dom';
import { Box, Grid, Breadcrumbs, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Typography, Button } from '../Wrappers';
import axios from 'axios';
import {
  NavigateNext as NavigateNextIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { getActiveProfileId } from '../../utils/profile';

// styles
import useStyles from '../Layout/styles';

// components
import structure from '../Sidebar/SidebarStructure';

// Tab styling
const CustomTab = styled(Tab)(() => ({
  minWidth: 72,
  textTransform: 'none',
  fontWeight: 400,
}));

//Sidebar structure
const BreadCrumbs = () => {
  const location = useLocation();
  const classes = useStyles();
  const [value, setValue] = React.useState(2);
  const [inventoryProductName, setInventoryProductName] = React.useState('');

  React.useEffect(() => {
    const match = location.pathname.match(/^\/app\/inventory\/(\d+)$/);
    if (!match) {
      setInventoryProductName('');
      return;
    }

    const fetchInventoryProductName = async () => {
      try {
        const profileId = getActiveProfileId();
        if (!profileId) {
          setInventoryProductName(match[1]);
          return;
        }

        const res = await axios.get(
          `http://localhost:3003/products/${match[1]}?profile_id=${profileId}`,
        );
        const name = res.data?.response?.data?.name;
        setInventoryProductName(name || match[1]);
      } catch (error) {
        setInventoryProductName(match[1]);
      }
    };

    fetchInventoryProductName();
  }, [location.pathname]);

  const renderBreadCrumbs = () => {
    let url = location.pathname;
    const routeSegments = url.split('/').slice(1);
    const route = routeSegments.map((segment, index) => {
      if (
        routeSegments[0] === 'app' &&
        routeSegments[1] === 'inventory' &&
        index === 2 &&
        inventoryProductName
      ) {
        return inventoryProductName;
      }

      return segment
          .split('-')
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(' ');
    });
    const length = route.length;
    return route.map((item, index) => {
      let middlewareUrl =
        '/' +
        url
          .split('/')
          .slice(1, index + 2)
          .join('/');

      return (
        <Breadcrumbs
          key={index + '_b'}
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'
        >
          <Typography
            variant='h6'
            color={length === index + 1 ? 'primary' : ''}
          >
            {length === index + 1 ? (
              item
            ) : (
              <Link
                to={middlewareUrl}
                style={{ color: 'unset', textDecoration: 'none' }}
              >
                {item}
              </Link>
            )}
          </Typography>
        </Breadcrumbs>
      );
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const date = () => {
    let dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let d = new Date()
    let year = d.getFullYear()
    let month = d.getMonth()
    let date = d.getDate()
    let day = d.getDay() + 1
    return `${date} ${monthNames[month]} ${year}, ${dayNames[day - 1]}`
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  return (
    <Widget
      disableWidgetMenu
      inheritHeight
      className={classes.margin}
      bodyClass={classes.navPadding}
    >
      <Grid
        container
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        wrap={'nowrap'}
        style={{ overflowX: 'auto' }}
      >
        {
           
          structure.map((c) => {
            if (
              location.pathname.includes(c.link) &&
              c.link &&
              c.label === 'Dashboard'
            ) {
              return (
                <Box display='flex' alignItems='center' key={c.id}>
                  <Breadcrumbs aria-label='breadcrumb'>
                    <Typography variant='h4'>{c.label}</Typography>
                  </Breadcrumbs>
                  {location.pathname.includes('/app/dashboard') && (
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      aria-label='simple tabs example'
                      variant='scrollable'
                      scrollButtons='auto'
                      style={{ marginLeft: 38 }}
                    >
                      <CustomTab label='Today' {...a11yProps(0)} />
                      <CustomTab label='This week' {...a11yProps(1)} />
                      <CustomTab label='This month' {...a11yProps(2)} />
                      <CustomTab label='This year' {...a11yProps(3)} />
                    </Tabs>
                  )}
                </Box>
              );
            }
          })
        }
        {location.pathname.includes('/app/dashboard') ? (
          <Box display='flex' alignItems='center'>
            <CalendarIcon className={classes.calendarIcon} />
            <Typography className={classes.date} style={{ marginRight: 38 }}>
              {/*29 Oct 2019, Tuesday*/}
              {date()}
            </Typography>
            <Button
              variant='contained'
              color='secondary'
              className={classes.button}
            >
              Latest Reports
            </Button>
          </Box>
        ) : (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize='small' />}
            aria-label='breadcrumb'
          >
            {renderBreadCrumbs()}
          </Breadcrumbs>
        )}
      </Grid>
    </Widget>
  );
};
export default BreadCrumbs;
