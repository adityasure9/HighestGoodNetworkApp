import React, { Component, useState } from 'react'
import '../Teams/Team.css';
import { Row, Col, Button, ToggleButton,ToggleButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
//import { Label, Input, Form } from 'reactstrap'
import { connect } from 'react-redux'
import { getUserProfile,getUserTask} from '../../actions/userProfile';
import {getUserProjects} from '../../actions/userProjects'
import _ from 'lodash'
import { getWeeklySummaries, updateWeeklySummaries } from '../../actions/weeklySummaries'
import moment from 'moment'
import "react-input-range/lib/css/index.css"
import Collapse from 'react-bootstrap/Collapse'
import * as d3 from 'd3'
import { DropdownItem, FormGroup, Label, Input, Form} from 'reactstrap';
import { getTimeEntriesForPeriod } from '../../actions/timeEntries'

class PeopleReport extends Component {
  constructor(props) {
    super(props);
    //this.props=props
    this.state = {
      userProfile: {},
      userTask:[],
      userProjects:{},
      userId: '',
      isLoading: true,
      infringments:{},
      isAssigned:"",
      isActive:"",
      priority:'',
      status:'',
      hasFilter:true,
      allClassification:[],
      classification:'',
      users:"",
      classificationList:[],
      priorityList:[],
      statusList:[],
      fromDate: "2016-01-01",
      toDate: this.endOfWeek(0),
      timeEntries: {},
    }
    this.setStatus=this.setStatus.bind(this)
    this.setPriority=this.setPriority.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setAssign=this.setAssign.bind(this)
    this.setFilter=this.setFilter.bind(this)
    this.setClassfication=this.setClassfication.bind(this)
    this.setUsers=this.setUsers.bind(this)
    this.setDate=this.setDate.bind(this)
  }

  async componentDidMount() {
    if (this.props.match) {
      const { userId } = this.props.match.params.userId
      await this.props.getUserProfile(this.props.match.params.userId)
      await this.props.getUserTask(this.props.match.params.userId)
      await this.props.getUserProjects(this.props.match.params.userId)
      await this.props.getWeeklySummaries(this.props.match.params.userId);
      await this.props.getTimeEntriesForPeriod(this.props.match.params.userId, this.state.fromDate, this.state.toDate)
      this.setState({
          userId: this.props.match.params.userId,
          isLoading: false,
          userProfile: {
            ...this.props.userProfile,
          },
          userTask :[
            ...this.props.userTask
          ],
          userProjects:{
              ...this.props.userProjects
          },
          allClassification:
            [...Array.from(new Set(this.props.userTask.map((item) => item.classification)))],
          infringments : this.props.userProfile.infringments,
          timeEntries : {
            ...this.props.timeEntries,},
        },()=>
          console.log(this.state.userProjects)
      )
    }
  }

  setDate(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  startOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD')
  }

  endOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD')
  }

  setActive(activeValue) {
    this.setState((state) => {
      return {
        isActive:activeValue
      }
    });
  }
  setPriority(priorityValue) {
    if (priorityValue!='Filter Off') {
      this.setState((state) => {
        return {
          priority: priorityValue,
          priorityList: this.state.priorityList.concat(priorityValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          priority: priorityValue,
          priorityList: []
        }
      });

    }
  }
  setStatus(statusValue) {
    if (statusValue!='Filter Off') {
      this.setState((state) => {
        return {
          status: statusValue,
          statusList: this.state.statusList.concat(statusValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          status: statusValue,
          statusList: []
        }
      });

    }
  }
  setAssign(assignValue) {
    this.setState((state) => {
      return {
        isAssigned:assignValue
      }
    });
  }

  setFilter(filterValue) {
    this.setState((state) => {
      return {
        isAssigned:false,
        isActive:false,
        priority:'',
        priorityList: [],
        status:'',
        statusList:[],
        classificationList:[],
        classification:'',
        users:"",
        fromDate: "",
        toDate: ""
      }
    });
  }

  setClassfication(classificationValue) {
    if (classificationValue!='Filter Off') {
      this.setState((state) => {
        return {
          classification: classificationValue,
          classificationList: this.state.classificationList.concat(classificationValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          classification: classificationValue,
          classificationList: []
        }
      });

    }
  }

  setUsers(userValue) {
    this.setState((state) => {
      return {
        users:userValue
      }
    });
  }

  render() {
    const {
      userProfile,
      infringments,
      userTask,
      userProjects,
      isAssigned,
      isActive,
      priority,
      status,
      allClassification,
      classification,
      classificationList,
      priorityList,
      statusList,
      users,
      fromDate,
      toDate,
      timeEntries
    } = this.state
    const {
      firstName,
      lastName,
      weeklyComittedHours,
      totalComittedHours,
      totalTangibleHrs
    } = userProfile

    var totalTangibleHrsRound = 0
    if (totalTangibleHrs) {
       totalTangibleHrsRound = totalTangibleHrs.toFixed(2);
    }

    const ShowCollapse = props => {
      const [open, setOpen] = useState(false);
      return(
        <div>
          <Button
            onClick={() => setOpen(!open)}
            aria-expanded={open}>
            {props.resources.length}     ➤
          </Button>
          <div>
            {props.resources[0].name}
          </div>

          {props.resources.slice(1).map(resource => (
            <Collapse in={open}>
              <div key={resource._id} white-space="pre-line" white-space="nowrap" className="new-line">
                {resource.name}
              </div>
            </Collapse>
          ))}
        </div>

      )
    }

    const ShowTasksCollapse = props => {
      const [open, setOpen] = useState(false);
      return(
        <div>
              <table className="center">
                <table className="table table-bordered table-responsive-sm">
                  <thead>
                  <tr>
                    <th scope="col">
                      <Button variant="light"
                        onClick={() => setOpen(!open)}
                        aria-expanded={open}>⬇</Button>
                    </th>
                    <th scope="col" id="projects__active">Task</th>
                    <th scope="col" id="projects__active">Priority</th>
                    <th scope="col" id="projects__active">Status</th>
                    <th scope="col" >Resources</th>
                    <th scope="col" id="projects__active">Active</th>
                    <th scope="col" id="projects__active">Assign</th>
                    <th scope="col" id="projects__active">Class</th>
                    <th scope="col" id="projects__active">Estimated Hours</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">End Date</th>
                  </tr>
                  </thead>
                  <Collapse in={open}>
                  <tbody>
                  { props.userTaskList}
                  </tbody>
                  </Collapse>
                </table>
              </table>
        </div>

      )
    }


    const UserTask = (props) => {
      let userTaskList = []
      let tasks=[]

      tasks=props.userTask
      if (props.userTask.length > 0) {
          if (!(props.isActive === "" )) {
            tasks = props.userTask.filter(item => item.isActive === props.isActive
            );
          }
          if (!(props.isAssigned ==="")) {
            tasks = props.userTask.filter(item => item.isAssigned === props.isAssigned);
          }

        if (props.priorityList.length>0){
          var i=0
          var get_tasks=[]
          while( i< props.priorityList.length) {
            if (props.priorityList[i] !='Filter Off') {
              for (var j = 0; j < tasks.length; j++) {
                if (tasks[j].priority === props.priorityList[i]) {
                  get_tasks.push(tasks[j])
                }
              }
              i += 1
            }
            else{
              get_tasks=props.tasks_filter
              break
            }
          }
          tasks=get_tasks
        }

        if (props.classificationList.length>0){
          var i=0
          var get_tasks=[]
          while( i< props.classificationList.length) {
            if (props.classificationList[i] !='Filter Off') {
              for (var j = 0; j < tasks.length; j++) {
                if (tasks[j].classification === props.classificationList[i]) {
                  get_tasks.push(tasks[j])
                }
              }
              i += 1
            }
            else{
              get_tasks=props.tasks_filter
              break
            }
          }
          tasks=get_tasks
        }
        if (props.statusList.length>0){
          var i=0
          var get_tasks=[]
          while( i< props.statusList.length) {
            if (props.statusList[i] !='Filter Off') {
              for (var j = 0; j < tasks.length; j++) {
                if (tasks[j].status === props.statusList[i]) {
                  get_tasks.push(tasks[j])
                }
              }
              i += 1
            }
            else{
              get_tasks=props.tasks_filter
              break
            }
          }
          tasks=get_tasks
        }

        if  (!(props.users === "")) {
          let test=[]
          for(var i = 0; i < tasks.length; i++) {
for (var j=0;j< tasks[i].resources.length;j++){
  if (tasks[i].resources[j].name===users){
    test.push(tasks[i])
  }
           }
          }
tasks=test
        }

if (tasks.length>0) {

  userTaskList = tasks.map((task, index) => (
    <tr id={"tr_" + task._id}>
      <th scope="row">
        <div>{index + 1}</div>
      </th>
      <td>
        {task.taskName}
      </td>
      <td>
        {task.priority}
      </td>
      <td>
        {task.status}
      </td>
      <td>
        {task.resources.length<=2 ?
          task.resources.map(resource => (
            <div key={resource._id}>{resource.name}</div>
          ))
          :
          <ShowCollapse resources={task.resources}/>
        }
      </td>

      <td className='projects__active--input'>
        {task.isActive ?
          <tasks className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></tasks> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>

      <td className='projects__active--input'>
        {task.isAssigned ?
          <div>Assign</div> :
          <div>Not Assign</div>}
      </td>
      <td className='projects__active--input'>
        {task.classification}
      </td>
      <td className='projects__active--input'>
        {task.estimatedHours.toFixed(2)}
      </td>
      <td>
        {task.startedDatetime}
      </td>
      <td>
        {task.dueDatetime}
      </td>
    </tr>
  ))
}
}
      return (
        <>
        <Row>
          <Col>
            <h2>Total: {userTaskList.length}</h2>
            <div>Selected filters:</div>
          </Col>
              <div className="row">
                <Col>
                  <Col>
                    Assignment:
                  </Col>
                  <Col>
                    <ToggleButtonGroup type="checkbox" variant="info">
                        {isAssigned ?
                          <ToggleButton variant="info">Assign</ToggleButton>
                          :
                          <ToggleButton variant="info">Not Assign</ToggleButton>
                        }
                      </ToggleButtonGroup>
                  </Col>
                </Col>
                <Col class="block">
                  <Col>
                    Active:
                  </Col>
                  <Col>
                    <ToggleButtonGroup type="checkbox" variant="info">
                      {isActive ?
                        <ToggleButton variant="info">Active</ToggleButton>
                        :
                        <ToggleButton variant="info">InActive</ToggleButton>
                      }
                    </ToggleButtonGroup>
                  </Col>
                </Col>

                {priorityList.length > 0 ? 
                    <Col class="block">
                        <Col>
                          Priority:
                        </Col>
                        <Col>
                          <ToggleButtonGroup type="checkbox" variant="info">
                          {priorityList.map((c, index) => (
                              <ToggleButton variant="info">{c}</ToggleButton>
                          ))}
                          </ToggleButtonGroup>
                        </Col>
                    </Col>
                  : <></>}
                  
                {statusList.length > 0 ?
                  <Col class="block">
                    <Col>
                      Status:
                    </Col>
                    <Col>
                      <ToggleButtonGroup type="checkbox" variant="info">
                        {statusList.map((c, index) => (
                          <ToggleButton variant="info">{c}</ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Col>
                  </Col>
                : <></>}

                {classificationList.length > 0 ? 
                  <Col class="block">
                    <Col>
                      Classification:
                    </Col>
                    <Col>
                      <ToggleButtonGroup type="checkbox" variant="info">
                        {classificationList.map((c, index) => (
                          <ToggleButton variant="info">{c}</ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Col>
                  </Col>
                : <></>}
                
                {users.length > 0 ?  
                  <Col class="block">
                  <Col>
                    User:
                  </Col>
                  <Col>
                    <ToggleButtonGroup type="checkbox" variant="info">
                        <ToggleButton variant="info">{users}</ToggleButton>
                    </ToggleButtonGroup>
                  </Col>
                  </Col>
                : <></>}
            </div>
        </Row>
          <Row>
             <ShowTasksCollapse userTaskList={userTaskList}/> {/*give margin zero on left & right to prevent cutting the edge */}
          </Row>
      </>
      )
    }
    const UserProject = props => {
      let userProjectList = []
      return (
        <div>
          { userProjectList }
        </div>
      )
    }

    const ClassificationOptions = props => {
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Classification">
        {props.allClassification.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setClassfication(c)}>{c}</Dropdown.Item>
          ))}

        </DropdownButton>
      )
    };

    const StatusOptions = props => {
      var allStatus=[...Array.from(new Set(props.get_tasks.map((item) => item.status))).sort()]
      allStatus.unshift("Filter Off")
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Status">
          {allStatus.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setStatus(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const UserOptions = props => {
      let users=[]
      props.userTask.map((task, index) => (
        task.resources.map(resource => (
         users.push(resource.name)
        ))
      ))

      users=Array.from(new Set(users)).sort()
      users.unshift("Filter Off")
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Users">
          {users.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setUsers(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };
    const ShowInfringmentsCollapse = props => {
      const [open, setOpen] = useState(false);
      return(
        <div>
          <table className="center">
            <table className="table table-bordered table-responsive-sm">
              <thead>
              <tr>
                <th scope="col" id="projects__order">
                  <Button variant="light"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}>
                    ⬇
                  </Button>
                </th>

                <th scope="col" id="projects__order">Date</th>
                <th scope="col">Description</th>
              </tr>
              </thead>
              <Collapse in={open}>
              <tbody>
              { props.BlueSquare }
              </tbody>
                </Collapse>
            </table>
          </table>

        </div>

      )
    }

    const InfrigmentsPlot = props => {
      var show = false
      //console.log('inPlot',props)

      const displayGraph = () => {
        show = !show
        if(!show){
          d3.selectAll('#bsplot > *').remove()
        }
        else{
          const margin = {top: 10, right: 30, bottom: 30, left: 60},
          width = 1000 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

          const svg = d3.select("#bsplot")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",`translate(${margin.left},${margin.top})`);

          const x = d3.scaleTime()
          .domain(d3.extent(props.bsCount, d => d.date))
          .range([ 0, width ]);
          svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

          const y = d3.scaleLinear()
          .domain( [0, props.maxSquareCount + 2])
          .range([ height, 0 ]);
          svg.append("g")
          .call(d3.axisLeft(y));

          svg.append("path")
          .datum(props.bsCount)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.count)))
            
          const Tooltip = d3.select("#bsplot")
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "5px")
          
          const mouseover = function(event,d) {
            Tooltip
              .style("opacity", 1)
          }
          const mousemove = function(event,d) {
            Tooltip
              .html("Exact date: " + d3.timeFormat("%A, %B %e, %Y")(d.date) + "<br>" + "Count: " + d.count)
              .style("left", `${event.pageX+10}px`)
              .style("top", `${event.pageY}px`)
          }
          const mouseleave = function(event,d) {
            Tooltip
              .style("opacity", 0)
          }

          svg
          .append("g")
          .selectAll("dot")
          .data(props.bsCount)
          .join("circle")
            .attr("class", "myCircle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.count))
            .attr("r", 3)
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 3)
            .attr("fill", "white")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
          }
      }

      return(
        <div>
          <Button onClick={() => displayGraph()} aria-expanded={show}>Plot Infringments Graph</Button>
          <div id="bsplot"></div>
        </div>
      )
    }

    const TimeLoggedPlot = props => {
      var show = false
      //console.log('inPlot',props)

      const displayGraph = () => {
        show = !show
        if(!show){
          d3.selectAll('#tlplot > *').remove()
        }
        else{
          const margin = {top: 10, right: 30, bottom: 30, left: 60},
          width = 1000 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

          const svg = d3.select("#tlplot")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",`translate(${margin.left},${margin.top})`);

          const x = d3.scaleTime()
          .domain(d3.extent(props.logs, d => d.date))
          .range([ 0, width ]);
          svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

          const y = d3.scaleLinear()
          .domain( [0, props.maxHoursCount + 2])
          .range([ height, 0 ]);
          svg.append("g")
          .call(d3.axisLeft(y));

          svg.append("path")
          .datum(props.logs)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.count)))
            
          const Tooltip = d3.select("#tlplot")
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "5px")
          
          const mouseover = function(event,d) {
            Tooltip
              .style("opacity", 1)
          }
          const mousemove = function(event,d) {
            Tooltip
              .html("Exact date: " + d3.timeFormat("%A, %B %e, %Y")(d.date) + "<br>" + "Count: " + d.count)
              .style("left", `${event.pageX+10}px`)
              .style("top", `${event.pageY}px`)
          }
          const mouseleave = function(event,d) {
            Tooltip
              .style("opacity", 0)
          }

          svg
          .append("g")
          .selectAll("dot")
          .data(props.logs)
          .join("circle")
            .attr("class", "myCircle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.count))
            .attr("r", 3)
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 3)
            .attr("fill", "white")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
          }
      }

      return(
        <div>
          <Button onClick={() => displayGraph()} aria-expanded={show}>Plot Entries Graph</Button>
          <div id="tlplot"></div>
        </div>
      )
    }

    const CombinedPlot = props => {
      var show = false
      var nested = d3.group(props.data, d=>d.type)
      console.log('filtered:',nested,'unfiltered',props.data)
      var color = d3.scaleOrdinal(d3.schemeCategory10)

      const displayGraph = () => {
        show = !show
        if(show){
          d3.selectAll('#combplot > *').remove()
        }
        else{
          const margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

          const svg = d3.select("#combplot")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",`translate(${margin.left},${margin.top})`);

          const x = d3.scaleTime()
          .domain(d3.extent(props.data, d => d.date))
          .range([ 0, width ]);
          svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

          const y = d3.scaleLinear()
          .domain( [0, props.maxHoursCount + 2])
          .range([ height, 0 ]);
          svg.append("g")
          .call(d3.axisLeft(y));

          var dataline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.count); });

          svg.selectAll("path.line")
          .data(nested)
            .enter().append('path')
            .attr("class", "line")
            .style("stroke", function(d) { // Add the colours dynamically
                return color(d[0]);
            })
            // .attr("id", function(d) {
            //     return 'tag'+d.key.replace(/\s+/g, ''); // assign ID
            // })
            .attr("stroke-width", 2)
            .attr("fill","none")
            .attr("d", (d) => {
              console.log(d[1])
              dataline(d[1])
            });
        }
      }


      return(
        <div>
          Comb Plot
        <Button onClick={() => displayGraph()} aria-expanded={show}>Plot combined Graph</Button>
        <div id="combplot"></div>
        </div>
      )
    }



    const Infringments = props => {
      let BlueSquare = []
      let dict= {}
      let timeEntriesDict = {}      
      const value=[]
      var timeEntryvalues = []
      var maxSquareCount = 0
      var maxHoursCount = 0

      //aggregate infringments
      for (let i = 0; i < props.infringments.length; i++) {
        if (props.infringments[i].date in dict){
          dict[props.infringments[i].date].count+=1
          dict[props.infringments[i].date].des.push(props.infringments[i].description)
        }else{
          dict[props.infringments[i].date]={count:1,des:[props.infringments[i].description]}
        }
      }

      //aggregate time entries
      if (props.timeEntries.period){
        for (let i = 0; i < props.timeEntries.period.length; i++ ){
          let convertedHours = parseInt(props.timeEntries.period[i].hours) + (props.timeEntries.period[i].minutes === '0' ? 0 : parseInt(props.timeEntries.period[i].minutes)/60)
          if(props.timeEntries.period[i].dateOfWork in timeEntriesDict){
            timeEntriesDict[props.timeEntries.period[i].dateOfWork].time += convertedHours
            //timeEntriesDict[props.timeEntries.period[i].dateOfWork].isTangible.push([props.timeEntries.period[i],isTangible, convertedHours])
            timeEntriesDict[props.timeEntries.period[i].dateOfWork].des.push(props.timeEntries.period[i].notes)

          }
          else{
            timeEntriesDict[props.timeEntries.period[i].dateOfWork] = {time: convertedHours,
                                                                        isTangible: [[props.timeEntries.period[i].isTangible, convertedHours]],
                                                                        des: [props.timeEntries.period[i].notes]
                                                                            }
          }
        }
      }

      //filter time entries and infrigments by date
      if ((props.fromDate == '') || (props.toDate == '')){
        for (var key in dict) {
            value.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),des:dict[key].des,count:dict[key].count,type: 'Infrigment'})
            if(dict[key].count > maxSquareCount){
              maxSquareCount = dict[key].count 
            }
        }
        for(var key in timeEntriesDict){
            timeEntryvalues.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),count: timeEntriesDict[key].time ,des:timeEntriesDict[key].des, isTangible: timeEntriesDict[key].isTangible, type: 'Entry'})
            if(timeEntriesDict[key].time > maxHoursCount){
              maxHoursCount = timeEntriesDict[key].time
            }
        }
      }
      else{
        for (var key in dict) {
          if((Date.parse(props.fromDate) <= Date.parse(key.toString())) & (Date.parse(key.toString()) <= Date.parse(props.toDate))){
            value.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),des:dict[key].des,count:dict[key].count,type: 'Infrigment'})
            if(dict[key].count > maxSquareCount){
              maxSquareCount = dict[key].count 
            }
          }
        }
        for(var key in timeEntriesDict){
          if((Date.parse(props.fromDate) <= Date.parse(key.toString())) & (Date.parse(key.toString()) <= Date.parse(props.toDate))){
            timeEntryvalues.push({date: d3.timeParse("%Y-%m-%d")(key.toString()),count: timeEntriesDict[key].time ,des:timeEntriesDict[key].des, isTangible: timeEntriesDict[key].isTangible,type: 'Entry'})
            if(timeEntriesDict[key].time > maxHoursCount){
              maxHoursCount = timeEntriesDict[key].time
            }
          }
      }
      }

      timeEntryvalues.sort(function(a,b){
        return new Date(b.date) - new Date(a.date)
      })
      
      var allData = timeEntryvalues.concat(value)

      console.log('Plot data:',value, maxSquareCount,"times:", timeEntryvalues)

      const startdate=Object.keys(dict)[0]
      var startdateStr=""
      if (startdate){
         startdateStr=startdate.toString()

      }
        if (props.infringments.length > 0) {
        BlueSquare = props.infringments.map((current, index) => (
          <tr className="teams__tr">
            <td>{index+1}
              </td>
          <td>
            {current.date}
          </td>
          <td>
            {current.description}
          </td>
          </tr>
        ))}
      return (
        <div>
        <h2>Blue Square: {infringments.length}</h2>
      <div>
      </div>
          <ShowInfringmentsCollapse BlueSquare={BlueSquare}/>
          <InfrigmentsPlot bsCount={value} maxSquareCount={maxSquareCount} />
          <TimeLoggedPlot logs={timeEntryvalues} maxHoursCount={maxHoursCount}/>
          <CombinedPlot data={allData} maxSquareCount={maxSquareCount} maxHoursCount={maxHoursCount} />
          </div>
      )
    }
    const StartDate = (props) => {
        return (
            <div>Start Date:{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</div>
    )
    };

    const ActiveOptions = props => {
      var allOptions=[...Array.from(new Set(props.get_tasks.map((item) => item.isActive.toString())))]
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Active Options">
          {allOptions.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setActive(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };



    const PriorityOptions = props => {
      var allPriorities=[...Array.from(new Set(props.get_tasks.map((item) => item.priority))).sort()]
      allPriorities.unshift("Filter Off")
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Priority">
          {allPriorities.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setPriority(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    

    const DateRangeSelect = () => {
      return(
        <div>
          <span />
                <Form inline className="mb-2">
                  <FormGroup className="mr-2">
                  <Label for="fromDate" className="mr-2">
                      From
                  </Label>
                  <Input
                    type="date"
                    name="fromDate"
                    id="fromDate"
                    value={this.state.fromDate}
                    onChange={this.setDate}
                  />
                  </FormGroup>
                  <span />
                  <FormGroup className="mr-2">
                  <Label for="toDate" className="mr-2">
                    To
                  </Label>
                  <Input
                    type="date"
                    name="toDate"
                    id="toDate"
                    value={this.state.toDate}
                    onChange={this.setDate}
                  />
                  </FormGroup>
              </Form>
        </div>
      )
    }

    return (
      
      <div className='container'>
        <table>
          <h1 className="center"
            style={{ display: 'inline-block', marginRight: 10 }}
          > {`${firstName} ${lastName}`}</h1>
          <div >Weekly Comitted Hours: {weeklyComittedHours}</div>
          <div>Total Comitted Hours:{totalComittedHours}</div>
          <div>Total Tangible Hours:{totalTangibleHrsRound}</div>
          <StartDate userProfile={userProfile}/>
          <div class="row" style={{justifyContent:'flex-start'}}>
            <div>
              <div><button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={()=>this.setFilter()}>Filters Off</button>
              </div>
            <div>
              <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={()=>this.setAssign(true)}  />
              Assigned
              <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={()=>this.setAssign(false) } />
              Not Assigned
              </div>
              <div>
              <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={()=>this.setActive(true)}  />
              Active
              <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={()=>this.setActive(false) } />
              Inactive
              </div>
              </div>
            <div className="row" style={{justifyContent:'space-evenly', margin:'3px'}}>
              <div> 
                <PriorityOptions get_tasks={userTask}/>
              </div>
              <div>
                <StatusOptions get_tasks={userTask}/>
              </div>
              <div>
                <ClassificationOptions allClassification={allClassification}/>
              </div>
              <div>
                <UserOptions userTask={userTask}/>
              </div>
              <div>
                <DateRangeSelect />
              </div>
            </div>
          </div>

            <UserTask userTask={userTask}
                      isAssigned={isAssigned}
                      isActive={isActive}
                      priority={priority}
                      status={status}
                      classification={classification}
                       users={users}
                      classificationList={classificationList}
                      priorityList={priorityList}
                      statusList={statusList}
            />
          <UserProject userProjects={userProjects}/>
          <Infringments infringments={infringments} fromDate={fromDate} toDate={toDate} timeEntries={timeEntries}/>

        </table>

      </div>
      
      )
    }
}


const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userTask: state.userTask,
  infringments: state.userProfile.infringments,
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
  isAssigned:state.isAssigned,
  isActive:state.isActive,
  priority:state.priority,
  status:state.status,
  hasFilter: state.hasFilter,
  allClassification:state.allClassification,
  classification:state.classification,
  users:state.users,
  classificationList:state.classificationList,
  priorityList:state.priorityList,
  statusList:state.statusList,
});

export default connect(mapStateToProps, {
  getUserProfile,
  getWeeklySummaries,
  updateWeeklySummaries,
  getUserTask,
  getUserProjects,
  getTimeEntriesForPeriod
})(PeopleReport);
