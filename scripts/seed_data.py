import os
import sys
from uuid import uuid4

# Add src to path so we can import internal modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select
from src.app.core.database import engine
from src.data_model.models import Tenant, Company, Job

def seed_data():
    with Session(engine) as session:
        # 1. Create a default tenant if it doesn't exist
        existing_tenant = session.exec(select(Tenant).where(Tenant.slug == "default")).first()
        if not existing_tenant:
            tenant = Tenant(name="Default Tenant", slug="default")
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
        else:
            tenant = existing_tenant

        # 2. Add some High-Growth Companies
        companies_data = [
            {
                "name": "OpenAI",
                "website_url": "https://openai.com",
                "description": "AI research and deployment company.",
                "total_funding_usd": 13000000000,
                "investors": "Microsoft, Thrive Capital, Khosla Ventures",
                "last_funding_round": "Series G"
            },
            {
                "name": "Stripe",
                "website_url": "https://stripe.com",
                "description": "Financial infrastructure for the internet.",
                "total_funding_usd": 9400000000,
                "investors": "Sequoia, Andreessen Horowitz, Tiger Global",
                "last_funding_round": "Series I"
            },
            {
                "name": "Anthropic",
                "website_url": "https://anthropic.com",
                "description": "AI safety and research company.",
                "total_funding_usd": 7600000000,
                "investors": "Amazon, Google, Salesforce Ventures",
                "last_funding_round": "Series C"
            }
        ]

        for data in companies_data:
            existing_company = session.exec(select(Company).where(Company.name == data["name"])).first()
            if not existing_company:
                company = Company(**data, tenant_id=tenant.id)
                session.add(company)
                session.commit()
                session.refresh(company)
                print(f"Added company: {company.name}")
                
                # Add some dummy jobs
                jobs = [
                    Job(title="Senior AI Engineer", location="San Francisco", job_url=f"{company.website_url}/careers/1", company_id=company.id, tenant_id=tenant.id),
                    Job(title="Product Manager", location="Remote", job_url=f"{company.website_url}/careers/2", company_id=company.id, tenant_id=tenant.id)
                ]
                for job in jobs:
                    session.add(job)
                session.commit()
            else:
                print(f"Company {data['name']} already exists.")

if __name__ == "__main__":
    print("Starting seeding process...")
    seed_data()
    print("Seeding completed successfully!")
