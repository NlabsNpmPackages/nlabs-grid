import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IDataAdapter } from '../adapters/data-adapter.interface';
import { GridDataResult, GridRequest } from '../models/grid.models';
import { User } from '../models/demo.models';

/**
 * Mock data adapter for demo purposes
 * Simulates backend API with mock data
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataAdapter implements IDataAdapter<User> {
  private mockUsers: User[] = this.generateMockUsers(500);

  getData(request: GridRequest): Observable<GridDataResult<User>> {
    // Simulate network delay
    return of(this.processRequest(request)).pipe(delay(300));
  }

  buildQuery(request: GridRequest): string {
    // Not used in mock adapter
    return '';
  }

  private processRequest(request: GridRequest): GridDataResult<User> {
    let data = [...this.mockUsers];

    // Apply filtering
    if (request.filter) {
      data = this.applyFilter(data, request.filter);
    }

    // Apply sorting
    if (request.orderBy) {
      data = this.applySort(data, request.orderBy);
    }

    const total = data.length;

    // Apply pagination
    const start = request.skip;
    const end = start + request.top;
    data = data.slice(start, end);

    return { data, total };
  }

  private applyFilter(data: User[], filter: string): User[] {
    // Simple contains filter for demo
    const lowerFilter = filter.toLowerCase();
    return data.filter(user =>
      user.name.toLowerCase().includes(lowerFilter) ||
      user.email.toLowerCase().includes(lowerFilter) ||
      user.city.toLowerCase().includes(lowerFilter)
    );
  }

  private applySort(data: User[], orderBy: string): User[] {
    const [field, order] = orderBy.split(' ');
    const multiplier = order === 'desc' ? -1 : 1;

    return data.sort((a: any, b: any) => {
      if (a[field] < b[field]) return -1 * multiplier;
      if (a[field] > b[field]) return 1 * multiplier;
      return 0;
    });
  }

  private generateMockUsers(count: number): User[] {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Chris', 'Anna', 'Tom', 'Lisa', 'Robert', 'Jennifer', 'William', 'Amanda', 'James', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Brittany'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Australia', 'Japan', 'Brazil'];
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'IT', 'Legal', 'Customer Service', 'R&D'];
    const jobTitles = ['Senior Manager', 'Team Lead', 'Developer', 'Designer', 'Analyst', 'Consultant', 'Specialist', 'Coordinator', 'Director', 'VP'];
    const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Park Blvd', 'Lake View', 'Hill Crest', 'River Side'];

    const users: User[] = [];

    for (let i = 1; i <= count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const age = Math.floor(Math.random() * 50) + 18;
      const salary = Math.floor(Math.random() * 150000) + 30000;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      const street = streets[Math.floor(Math.random() * streets.length)];
      const address = `${Math.floor(Math.random() * 9999) + 1} ${street}`;
      const zipCode = String(Math.floor(Math.random() * 90000) + 10000);
      const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const managerFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const managerLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const manager = `${managerFirstName} ${managerLastName}`;
      const active = Math.random() > 0.3;
      const startDate = new Date(2015 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const registeredDate = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const lastLogin = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const notes = `Employee note #${i} - Performance review pending`;

      users.push({ 
        id: i, 
        name, 
        email, 
        age, 
        salary, 
        department, 
        city, 
        country,
        phone,
        address,
        zipCode,
        jobTitle,
        manager,
        active, 
        startDate, 
        registeredDate,
        lastLogin,
        notes
      });
    }

    return users;
  }
}
