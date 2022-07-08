import { yearsToMonths } from 'date-fns/fp';
import { useState } from 'react';
import 'reactjs-popup/dist/index.css';
import { Container } from 'reactstrap';
import './PeopleTableDetails.css';
import { NewModal } from 'components/common/NewModal';
import TableFilter from './TableFilter/TableFilter';
import { TableHeader } from './TableHeader';

const PeopleTableDetails = (props) => {

  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [resources, setResources] = useState('');
  const [active, setActive] = useState('');
  const [assign, setAssign] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [order, setOrder] = useState('');
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')
  const [deletePopup, setDeletePopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [startDate, setStartDate] =useState('');
  const [endDate, setEndDate] =useState('');

  const onTaskNameSearch = (text) => {
    setName(text);
  }; 

  const searchPriority = (text) => {
    setPriority(text);
  }

  const searchEstimatedHours = (text) => {
    setEstimatedHours(text);
  }

  const searchResources = (text) => {
    setResources(text);
  }

  const searchStatus = (text) => {
    setStatus(text);
  }

  const searchActive = (text) => {
    setActive(text);
  }

  const searchAssign = (text) => {
    setAssign(text);
  }

  const resetFilters = () => {
    setName('');
    setPriority('');
    setStatus('');
    setResources('');
    setOrder('');
    setActive('');
    setAssign('');
    setEstimatedHours('');
  }

  const filterTasks = (tasks) => {
    let simple=[];
    let filteredList = tasks.filter((task) => {
      if (task.taskName.toLowerCase().includes(name.toLowerCase())  &&
        (task?.priority?.toLowerCase().includes(priority.toLowerCase()) ) &&
        ( task?.status?.toLowerCase().includes(status.toLowerCase()) ) &&    
        ( task?.active?.toLowerCase().includes(active.toLowerCase()) ) &&
        (task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase())) &&
        (task?.assign?.toLowerCase().includes(assign.toLowerCase()) )) {
          return true;     
      }
    });
    filteredList = filteredList.filter((task) => {
      let flag = false;
      for (let i = 0; i<task.resources[0].length; i++) {
          if ( task.resources[0][i].name.toLowerCase().includes(resources.toLowerCase() ) ){
              flag = true;
              break;
          }
      }
      return flag;
  })
    return filteredList;
  }
  let toggleMoreResourcesStatus = true;
  const toggleMoreResources = (id) => {
    let x=document.getElementById(id);
    // let hidden = x.getAttribute("hidden");
    if (toggleMoreResourcesStatus) {
      x.style.display = 'table-cell';
    } else {
      x.style.display = 'none';
    }
    toggleMoreResourcesStatus = !toggleMoreResourcesStatus;
  }
  let filteredTasks = filterTasks(props.taskData);

  const renderFilteredTask = (value) => (
    <tr key={value._id}>
      <td >{value.taskName}</td>
      <td >{value.priority}</td>
      <td >{value.status}</td>
      <td >
        {value.resources?.map(res=>
          
          res.map((resource,index)=>{
            if(index<2){
              return <img key={resource.index} alt={resource.name} src={resource.profilePic||'/pfp-default.png'}  
                        className='img-circle' auto="format" title={resource.name}/>
              
            }
        }),
      )}
        {value.resources?.map(res=>
        res.length >2 ? <a className="name resourceMoreToggle" onClick={() => 
                toggleMoreResources(value._id)}>
            <span className="dot">{res.length - 2}+</span>
          </a>:null
        )}
        <tr id={value._id} class="extra" >
          <td class="extra1" >
            {value.resources?.map(res=>
              res.map((resource,index)=>{
                if(index>=2){
                  return <img key={resource.index} alt={resource.name} src={resource.profilePic||'/pfp-default.png'} 
                    className='img-circle' auto="format" title={resource.name}/>
                }
            }),
          )}
          </td>
        </tr>
        
      </td>
      <td >{value.active === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}</td>
      <td >{value.assign === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}</td>
      <td >{value.estimatedHours}</td>
      <td >{value.startDate}</td>
      <td >{value.endDate}</td>  
    </tr>
  )

  return (
    <Container fluid className="wrapper">
      <TableFilter
          onTaskNameSearch={onTaskNameSearch}
          searchPriority={searchPriority}
          searchResources={searchResources}
          searchStatus={searchStatus}
          searchActive={searchActive}
          searchAssign={searchAssign}
          searchEstimatedHours={searchEstimatedHours}
          resetFilters={resetFilters}
          name={name}
          order={order}
          priority={priority}
          status={status}
          resources={resources}
          active={active}
          assign={assign}
          estimatedHours={estimatedHours}
          startDate={startDate}
          EndDate={endDate}
        />
      <table className="table people-table">
        <thead>
        <TableHeader />
        </thead>
        <tbody>
        {filteredTasks.map((value) => (
          <NewModal header={"Task info"} trigger={() => renderFilteredTask(value)}>
            <div>Why This Task is important</div>
            <textarea
                className='rectangle'
                type="text"
                value={value.whyInfo}
            />
            <div>Design Intent</div>
            <textarea
                className='rectangle'
                type="text"
                value={value.intentInfo}
                // onChange={this.handleChange}
            />
            <div>End State</div>
            <textarea
                className='rectangle'
                type="text"
                value={value.endstateInfo}
                // onChange={this.handleChange}
            />
          </NewModal>
        ))}
        </tbody>
      </table>
    </Container >
  );
};


export default PeopleTableDetails;
